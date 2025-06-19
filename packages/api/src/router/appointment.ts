import {
  addMinutes,
  endOfDay,
  isAfter,
  isSameDay,
  parse,
  parseISO,
  startOfDay,
} from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import { z } from "zod";

import { and, eq, exists, gt, gte, isNull, lt, lte, or } from "@acme/db";
import { db } from "@acme/db/client";
import {
  appointments,
  customerLoyalty,
  customerPackages,
  customers,
  employees,
  loyaltyBonuses,
  loyaltyPrograms,
  openingHours,
  packageAppointments,
  paymentTypeEnum,
  servicePackages,
  services,
  unavailabilities,
} from "@acme/db/schema";
import { clearNumber } from "@acme/utils";
import { publicCreateAppointmentSchema } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const appointmentRouter = {
  listAppointments: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.appointments.findMany({
      where: eq(appointments.establishmentId, ctx.establishmentId),
      with: {
        employee: true,
        service: true,
        customer: true,
        packageAppointment: {
          with: {
            package: {
              with: {
                package: true,
              },
            },
          },
        },
      },
    });

    return result;
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.appointments.findFirst({
        where: and(
          eq(appointments.establishmentId, ctx.establishmentId),
          eq(appointments.id, input.id),
        ),
        with: {
          employee: true,
          service: true,
          customer: true,
          packageAppointment: {
            with: {
              package: {
                with: {
                  package: true,
                },
              },
            },
          },
        },
      });

      return result;
    }),

  listAppointmentsByPeriod: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.appointments.findMany({
        where: and(
          eq(appointments.establishmentId, ctx.establishmentId),
          gte(appointments.startTime, input.startDate),
          lte(appointments.endTime, input.endDate),
        ),
        with: {
          employee: true,
          service: true,
          customer: true,
        },
      });
    }),

  cancelAppointment: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [appointment] = await db
        .update(appointments)
        .set({ status: "completed" })
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.establishmentId, ctx.establishmentId),
          ),
        )
        .returning();

      return appointment;
    }),

  getAvailableSlots: publicProcedure
    .input(
      z.object({
        serviceId: z.string().uuid(),
        employeeId: z.string().uuid().optional(),
        establishmentId: z.string().uuid(),
        date: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { serviceId, employeeId, establishmentId } = input;
      const { db } = ctx;

      const timeZone = "America/Sao_Paulo";
      const zonedDate = toZonedTime(input.date, timeZone);

      console.log("=== INÍCIO DA REQUISIÇÃO ===");
      console.log("Input:", {
        serviceId,
        employeeId,
        establishmentId,
        date: format(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
      });

      const dayOfWeek = zonedDate.getDay();
      console.log(
        "Dia da semana calculado:",
        dayOfWeek,
        `(${["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][dayOfWeek]})`,
      );

      // 1. Buscar informações do serviço
      const service = await db.query.services.findFirst({
        where: eq(services.id, serviceId),
      });

      console.log("Serviço encontrado:", service);
      if (!service) {
        console.error("Serviço não encontrado para ID:", serviceId);
        throw new Error("Serviço não encontrado");
      }

      // 2. Buscar horário de funcionamento
      const openingHoursResult = await db.query.openingHours.findFirst({
        where: and(
          eq(openingHours.establishmentId, establishmentId),
          eq(openingHours.dayOfWeek, dayOfWeek),
        ),
        with: {
          intervals: true,
        },
      });

      console.log("Horário de funcionamento encontrado:", openingHoursResult);
      if (!openingHoursResult) {
        console.log("Nenhum horário encontrado para este dia");
        return {
          available: false,
          message: "Estabelecimento não funciona neste dia",
          slots: [],
        };
      }

      // 3. Buscar indisponibilidades do funcionário
      const employeeUnavailabilities = employeeId
        ? await db.query.unavailabilities.findMany({
            where: and(
              eq(unavailabilities.employeeId, employeeId),
              or(
                eq(unavailabilities.dayOfWeek, dayOfWeek),
                isNull(unavailabilities.dayOfWeek),
              ),
            ),
          })
        : [];

      console.log(
        "Indisponibilidades encontradas:",
        employeeUnavailabilities.length,
        employeeUnavailabilities,
      );

      // 4. Buscar agendamentos existentes
      const existingAppointments = await db.query.appointments.findMany({
        where: and(
          gte(appointments.startTime, startOfDay(zonedDate)),
          lte(appointments.endTime, endOfDay(zonedDate)),
          employeeId ? eq(appointments.employeeId, employeeId) : undefined,
          eq(appointments.establishmentId, establishmentId),
        ),
      });

      console.log(
        "Agendamentos existentes:",
        existingAppointments.length,
        existingAppointments.map((a) => ({
          start: format(a.startTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
          end: format(a.endTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
        })),
      );

      // 5. Gerar slots disponíveis
      const slots = [];

      const intervals =
        openingHoursResult.intervals.length > 0
          ? openingHoursResult.intervals
          : [
              {
                startTime: openingHoursResult.openingTime,
                endTime: openingHoursResult.closingTime,
              },
            ];

      console.log("Processando intervalos:", intervals);

      for (const interval of intervals) {
        const intervalStart = parse(interval.startTime, "HH:mm:ss", zonedDate);
        const intervalEnd = parse(interval.endTime, "HH:mm:ss", zonedDate);

        console.log("\nProcessando intervalo:", {
          start: format(intervalStart, "yyyy-MM-dd'T'HH:mm:ssXXX", {
            timeZone,
          }),
          end: format(intervalEnd, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
        });

        let currentSlotStart = intervalStart;
        let slotCount = 0;

        while (currentSlotStart < intervalEnd) {
          const slotEnd = addMinutes(currentSlotStart, service.duration);
          slotCount++;

          console.log(`\nSlot ${slotCount}:`, {
            currentSlotStart: format(
              currentSlotStart,
              "yyyy-MM-dd'T'HH:mm:ssXXX",
              { timeZone },
            ),
            slotEnd: format(slotEnd, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
            serviceDuration: service.duration,
          });

          if (slotEnd > intervalEnd) {
            console.log("Slot ultrapassa intervalo - pulando");
            currentSlotStart = addMinutes(currentSlotStart, 15);
            continue;
          }

          // Verificar conflitos com agendamentos existentes
          const hasConflict = existingAppointments.some((appointment) => {
            const conflict =
              appointment.startTime < slotEnd &&
              appointment.endTime > currentSlotStart;
            if (conflict) {
              console.log(
                "Conflito encontrado com agendamento:",
                appointment.id,
                format(appointment.startTime, "HH:mm", { timeZone }),
                "-",
                format(appointment.endTime, "HH:mm", { timeZone }),
              );
            }
            return conflict;
          });

          // Verificar indisponibilidades do funcionário
          const isUnavailable = employeeUnavailabilities.some((ua) => {
            if (!ua.startTime || !ua.endTime) return false;

            const uaStart = parse(ua.startTime, "HH:mm:ss", zonedDate);
            const uaEnd = parse(ua.endTime, "HH:mm:ss", zonedDate);

            const unavailable = currentSlotStart < uaEnd && slotEnd > uaStart;
            if (unavailable) {
              console.log(
                "Conflito com indisponibilidade:",
                ua.id,
                format(uaStart, "HH:mm", { timeZone }),
                "-",
                format(uaEnd, "HH:mm", { timeZone }),
              );
            }
            return unavailable;
          });

          const formattedStart = format(
            currentSlotStart,
            "yyyy-MM-dd'T'HH:mm:ssXXX",
            { timeZone },
          );
          const formattedEnd = format(slotEnd, "yyyy-MM-dd'T'HH:mm:ssXXX", {
            timeZone,
          });

          slots.push({
            start: formattedStart,
            end: formattedEnd,
            available: !hasConflict && !isUnavailable,
            reason: hasConflict
              ? "Horário já agendado"
              : isUnavailable
                ? "Funcionário indisponível"
                : undefined,
          });

          console.log("Slot adicionado:", {
            start: formattedStart,
            end: formattedEnd,
            available: !hasConflict && !isUnavailable,
          });

          currentSlotStart = addMinutes(
            currentSlotStart,
            Math.max(15, service.duration),
          );
        }
      }

      const nowInSaoPaulo = toZonedTime(new Date(), timeZone);
      const isToday = isSameDay(zonedDate, nowInSaoPaulo);

      console.log("\nFiltro final:");
      console.log(
        "Data atual REAL:",
        format(nowInSaoPaulo, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
      );

      const filteredSlots = slots.filter((slot) => {
        // Converter o slot para Date no timezone correto
        const slotDate = parseISO(slot.start);
        const slotDateInSP = toZonedTime(slotDate, timeZone);

        // Verificação precisa do horário
        const isPastSlot = isToday && isAfter(nowInSaoPaulo, slotDateInSP);

        if (isPastSlot) {
          console.log(
            "Slot removido (passado):",
            format(slotDateInSP, "HH:mm"),
            "<",
            format(nowInSaoPaulo, "HH:mm"),
          );
        }

        return slot.available && !isPastSlot;
      });

      console.log("Slots após filtro:", filteredSlots.length);
      console.log("Slots filtrado:", filteredSlots);
      console.log("=== FIM DA REQUISIÇÃO ===");

      return {
        service,
        date: format(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
        openingHours: {
          openingTime: openingHoursResult.openingTime,
          closingTime: openingHoursResult.closingTime,
        },
        availableSlots: filteredSlots,
      };
    }),

  checkInAppointment: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string().uuid(),
        paymentType: z.enum(paymentTypeEnum.enumValues),
        paymentAmount: z.string().optional(),
        paymentNote: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Busca o agendamento com relações
      const appointment = await ctx.db.query.appointments.findFirst({
        where: and(
          eq(appointments.id, input.appointmentId),
          eq(appointments.establishmentId, ctx.establishmentId),
          eq(appointments.status, "scheduled"),
        ),
        with: {
          customer: true,
          employee: true,
          service: true,
          packageAppointment: {
            with: {
              package: true,
            },
          },
        },
      });

      if (!appointment) {
        throw new Error("Agendamento não encontrado ou já concluído");
      }

      // 2. Lógica de pacotes
      let customerPackage = appointment.packageAppointment?.package ?? null;
      let isFirstPackageUsage = false;

      if (customerPackage) {
        // Se for o primeiro uso (não pago ainda)
        if (!customerPackage.paid) {
          const servicePackage = await ctx.db.query.servicePackages.findFirst({
            where: eq(servicePackages.id, customerPackage.packageId),
          });

          if (!servicePackage) {
            throw new Error("Pacote associado não encontrado");
          }

          // Marca como pago e decrementa sessão
          await ctx.db
            .update(customerPackages)
            .set({
              paid: true,
              remainingSessions: customerPackage.remainingSessions - 1,
            })
            .where(eq(customerPackages.id, customerPackage.id));

          isFirstPackageUsage = true;

          // Mensagem de confirmação de pagamento
          const packageMessage =
            `📦 *Pagamento do Pacote Confirmado* 📦\n\n` +
            `Você utilizou 1 sessão do seu pacote de ${servicePackage.quantity} ${appointment.service.name}.\n` +
            `Valor total pago: R$ ${servicePackage.packagePrice}\n\n` +
            `Sessões restantes: ${customerPackage.remainingSessions - 1}`;

          await sendWhatsappMessage(
            appointment.customer.phoneNumber,
            packageMessage,
          );
        } else {
          // Apenas decrementa sessão
          await ctx.db
            .update(customerPackages)
            .set({
              remainingSessions: customerPackage.remainingSessions - 1,
            })
            .where(eq(customerPackages.id, customerPackage.id));

          // Mensagem normal
          const message =
            `✅ *Serviço Concluído* ✅\n\n` +
            `Serviço: ${appointment.service.name}\n` +
            `Sessões restantes no pacote: ${customerPackage.remainingSessions - 1}`;

          await sendWhatsappMessage(appointment.customer.phoneNumber, message);
        }
      }

      // 3. Atualiza o agendamento
      const [updatedAppointment] = await ctx.db
        .update(appointments)
        .set({
          status: "completed",
          checkin: true,
          checkinAt: new Date(),
          paymentType: input.paymentType,
          paymentAmount: input.paymentAmount?.replace(",", "."),
          paymentNote: input.paymentNote,
        })
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.establishmentId, ctx.establishmentId),
          ),
        )
        .returning();

      // 4. Processa fidelidade
      await processLoyalty({
        customerId: appointment.customer.id,
        customerName: appointment.customer.name,
        phoneNumber: appointment.customer.phoneNumber,
        establishmentId: ctx.establishmentId,
        serviceId: appointment.serviceId,
      });

      return {
        ...updatedAppointment,
        packageInfo: customerPackage
          ? {
              remainingSessions: customerPackage.remainingSessions - 1,
              totalSessions: customerPackage.totalSessions,
              isFirstUsage: isFirstPackageUsage,
            }
          : null,
      };
    }),

  publicCreateAppointment: publicProcedure
    .input(
      publicCreateAppointmentSchema.extend({
        servicePackageId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const getEmployeeName = async (employeeId: string) => {
        const employee = await db.query.employees.findFirst({
          where: eq(employees.id, employeeId),
        });
        return employee?.name || "Profissional não especificado";
      };

      const customerPhone = clearNumber(input.customer.phoneNumber);

      // 1. Validação do serviço
      const service = await db.query.services.findFirst({
        where: eq(services.id, input.serviceId),
      });

      if (!service) {
        throw new Error("Serviço não encontrado");
      }

      // 2. Verificação de conflitos de horário
      const conflictingAppointments = await db.query.appointments.findMany({
        where: and(
          input.employeeId
            ? eq(appointments.employeeId, input.employeeId)
            : undefined,
          or(
            and(
              gte(appointments.startTime, input.startTime),
              lt(appointments.startTime, input.endTime),
            ),
            and(
              gt(appointments.endTime, input.startTime),
              lte(appointments.endTime, input.endTime),
            ),
            and(
              lte(appointments.startTime, input.startTime),
              gte(appointments.endTime, input.endTime),
            ),
          ),
        ),
      });

      if (conflictingAppointments.length > 0) {
        throw new Error(
          "Conflito de horário: já existe um agendamento neste período",
        );
      }

      // 3. Buscar ou criar cliente
      let customer = await db.query.customers.findFirst({
        where: and(
          eq(customers.phoneNumber, customerPhone),
          eq(customers.establishmentId, input.establishmentId),
        ),
      });

      const customerPayload = {
        ...input.customer,
        phoneNumber: customerPhone,
        cpf: input.customer.cpf ? clearNumber(input.customer.cpf) : undefined,
        establishmentId: input.establishmentId,
      };

      if (!customer) {
        [customer] = await db
          .insert(customers)
          .values(customerPayload)
          .returning();
      } else {
        await db
          .update(customers)
          .set(customerPayload)
          .where(eq(customers.id, customer.id!));
      }

      // 4. Lógica de pacotes - VERSÃO CORRIGIDA
      let customerPackage = null;
      let isNewPackage = false;

      if (input.servicePackageId) {
        // Verifica se o pacote existe para este serviço
        const servicePackage = await db.query.servicePackages.findFirst({
          where: and(
            eq(servicePackages.id, input.servicePackageId),
            eq(servicePackages.serviceId, input.serviceId),
          ),
        });

        if (!servicePackage) {
          throw new Error("Pacote inválido para este serviço");
        }

        // Busca pacotes válidos (não expirados e com sessões)
        const validPackages = await db.query.customerPackages.findMany({
          where: and(
            eq(customerPackages.customerId, customer!.id),
            eq(customerPackages.packageId, input.servicePackageId),
            gt(customerPackages.remainingSessions, 0),
            or(
              isNull(customerPackages.expiresAt),
              gt(customerPackages.expiresAt, new Date()),
            ),
          ),
        });

        // Se tem pacote válido, usa ele
        if (validPackages.length > 0) {
          customerPackage = validPackages[0];
        } else {
          // Cria novo pacote mesmo se já tiver um expirado/esgotado
          [customerPackage] = await db
            .insert(customerPackages)
            .values({
              packageId: input.servicePackageId,
              customerId: customer!.id,
              employeeId: input.employeeId || null,
              remainingSessions: servicePackage.quantity,
              totalSessions: servicePackage.quantity,
              paid: false,
              purchasedAt: new Date(),
            })
            .returning();
          isNewPackage = true;
        }
      } else {
        // Se não enviou packageId, verifica se tem pacotes válidos para o serviço
        const validPackages = await db.query.customerPackages.findMany({
          where: and(
            eq(customerPackages.customerId, customer!.id),
            gt(customerPackages.remainingSessions, 0),
            or(
              isNull(customerPackages.expiresAt),
              gt(customerPackages.expiresAt, new Date()),
            ),
          ),
        });

        if (validPackages.length > 0) {
          customerPackage = validPackages[0];
        }
      }

      // 5. Criação do agendamento
      const [appointment] = await db
        .insert(appointments)
        .values({
          establishmentId: input.establishmentId,
          status: "scheduled",
          checkin: false,
          customerId: customer!.id,
          employeeId: input.employeeId!,
          startTime: input.startTime,
          endTime: input.endTime,
          serviceId: input.serviceId,
          paymentType: customerPackage ? "package" : undefined,
        })
        .returning();

      // 6. Associação com pacote (se aplicável)
      if (customerPackage) {
        await db.insert(packageAppointments).values({
          packageId: customerPackage.id,
          appointmentId: appointment!.id,
        });
      }

      // 7. Envio de confirmação
      const employeeName = await getEmployeeName(input.employeeId!);
      const message =
        `✅ *Agendamento Confirmado* ✅\n\n` +
        `Serviço: ${service.name}\n` +
        `Data: ${format(input.startTime, "dd/MM/yyyy 'às' HH:mm")}\n` +
        `Profissional: ${employeeName}\n\n` +
        (customerPackage
          ? isNewPackage
            ? `Você adquiriu um novo pacote de ${customerPackage.totalSessions} sessões.`
            : `Usando seu pacote existente (${customerPackage.remainingSessions}/${customerPackage.totalSessions} sessões restantes).`
          : `Valor a pagar: R$ ${service.price}`);

      await sendWhatsappMessage(customer!.phoneNumber, message);

      return {
        success: true,
        appointment,
        packageUsed: customerPackage
          ? {
              id: customerPackage.id,
              isNew: isNewPackage,
              remainingSessions: customerPackage.remainingSessions,
              totalSessions: customerPackage.totalSessions,
            }
          : null,
      };
    }),
};

type ProcessLoyaltyParams = {
  customerId: string;
  phoneNumber: string;
  customerName: string;
  serviceId: string;
  establishmentId: string;
};

export async function processLoyalty({
  customerId,
  phoneNumber,
  customerName,
  serviceId,
  establishmentId,
}: ProcessLoyaltyParams) {
  // 1. Buscar programas de fidelidade ativos para este serviço
  const activePrograms = await db.query.loyaltyPrograms.findMany({
    where: and(
      eq(loyaltyPrograms.serviceId, serviceId),
      eq(loyaltyPrograms.establishmentId, establishmentId),
      eq(loyaltyPrograms.active, true),
    ),
  });

  for (const program of activePrograms) {
    // 2. Buscar ou criar registro de fidelidade do cliente
    let loyalty = await db.query.customerLoyalty.findFirst({
      where: and(
        eq(customerLoyalty.programId, program.id),
        eq(customerLoyalty.customerId, customerId),
      ),
    });

    if (!loyalty) {
      [loyalty] = await db
        .insert(customerLoyalty)
        .values({
          programId: program.id,
          customerId,
          accumulatedPoints: 0,
          lastUpdated: new Date(),
        })
        .returning();
    }

    // 3. Verificar se cliente tem bônus não utilizado para este serviço
    const unusedBonus = await db.query.loyaltyBonuses.findFirst({
      where: and(
        eq(loyaltyBonuses.loyaltyId, loyalty!.id),
        eq(loyaltyBonuses.bonusServiceId, serviceId),
        eq(loyaltyBonuses.used, false),
      ),
    });

    if (unusedBonus) {
      // 4. Se tiver bônus, verificar a quantidade e atualizar
      if (unusedBonus.quantity > 1) {
        // Diminuir a quantidade em 1 em vez de marcar como usado
        await db
          .update(loyaltyBonuses)
          .set({
            quantity: unusedBonus.quantity - 1,
          })
          .where(eq(loyaltyBonuses.id, unusedBonus.id));

        const remainingBonuses = unusedBonus.quantity - 1;
        await sendWhatsappMessage(
          phoneNumber,
          `🎁 Bônus utilizado! Você ainda tem ${remainingBonuses} bônus disponíveis para o serviço ${program.name}.`,
        );
      } else {
        // Se só tiver 1, marcar como usado
        await db
          .update(loyaltyBonuses)
          .set({
            used: true,
            usedAt: new Date(),
          })
          .where(eq(loyaltyBonuses.id, unusedBonus.id));

        await sendWhatsappMessage(
          phoneNumber,
          `🎁 Bônus utilizado! Seu serviço ${program.name} foi pago com pontos de fidelidade.`,
        );
      }
      continue;
    }

    // 5. Adicionar pontos ao cliente
    const newPoints = loyalty!.accumulatedPoints + program.pointsPerService;
    const pointsNeeded =
      program.requiredPoints - (newPoints % program.requiredPoints);
    const earnedBonus = Math.floor(newPoints / program.requiredPoints);

    // 6. Atualizar pontos do cliente
    await db
      .update(customerLoyalty)
      .set({
        accumulatedPoints: newPoints % program.requiredPoints,
        lastUpdated: new Date(),
      })
      .where(eq(customerLoyalty.id, loyalty!.id));

    // 7. Enviar notificação de pontos acumulados
    await sendWhatsappMessage(
      phoneNumber,
      `📊 Pontos de fidelidade: +${program.pointsPerService} pontos!
        Total: ${newPoints} pontos
        Faltam ${pointsNeeded} pontos para ganhar seu próximo bônus!`,
    );

    // 8. Se ganhou bônus, criar registro e notificar
    if (earnedBonus > 0) {
      const [bonusService] = await db
        .select()
        .from(services)
        .where(eq(services.id, program.bonusServiceId));

      await db.insert(loyaltyBonuses).values({
        loyaltyId: loyalty!.id,
        bonusServiceId: program.bonusServiceId,
        quantity: earnedBonus * program.bonusQuantity,
        earnedAt: new Date(),
        used: false,
      });

      await sendWhatsappMessage(
        phoneNumber,
        `🎉 PARABÉNS ${customerName.toUpperCase()}! Você ganhou ${earnedBonus * program.bonusQuantity} bônus de ${bonusService?.name}.
Agende este serviço gratuitamente usando seus pontos!`,
      );
    }
  }
}

export async function sendWhatsappMessage(
  phoneNumber: string,
  message: string,
) {
  try {
    // Implementação real com Twilio ou outro serviço
    console.log(`[WhatsApp] To: ${phoneNumber}\nMessage: ${message}`);
    return true;
  } catch (error) {
    console.error("WhatsApp error:", error);
    return false;
  }
}
