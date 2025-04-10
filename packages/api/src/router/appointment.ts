import { addMinutes, endOfDay, parse, startOfDay } from "date-fns";
import { z } from "zod";

import { and, eq, gt, gte, isNull, lt, lte, or } from "@acme/db";
import { db } from "@acme/db/client";
import {
  appointments,
  customers,
  openingHours,
  services,
  unavailabilities,
} from "@acme/db/schema";
import { clearNumber } from "@acme/utils";
import { publicCreateAppointmentSchema } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

const brazilOffset = -3;

export const appointmentRouter = {
  listAppointments: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.appointments.findMany({
      where: eq(appointments.establishmentId, ctx.establishmentId),
      with: {
        employee: true,
        service: true,
        customer: true,
      },
    });
  }),

  publicCreateAppointment: publicProcedure
    .input(publicCreateAppointmentSchema)
    .mutation(async ({ ctx, input }) => {
      const customerPhone = clearNumber(input.customer.phoneNumber ?? "");

      const service = await db.query.services.findFirst({
        where: eq(services.id, input.serviceId),
      });

      if (!service) {
        throw new Error("Serviço não encontrado");
      }

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
        throw new Error("Horário já agendado");
      }

      let customer = await db.query.customers.findFirst({
        where: or(
          eq(customers.phoneNumber, customerPhone),
          eq(customers.establishmentId, input.establishmentId),
        ),
      });

      console.log({ customer });

      const customerPayload = {
        ...input.customer,
        phoneNumber: customerPhone,
        cpf: clearNumber(input.customer.cpf ?? ""),
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
        })
        .returning();

      return appointment;
    }),

  updateAppointmentStatus: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string().uuid(),
        status: z.enum(["scheduled", "completed"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [appointment] = await db
        .update(appointments)
        .set({ status: input.status })
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.establishmentId, ctx.establishmentId),
          ),
        )
        .returning();

      return appointment;
    }),

  checkInAppointment: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [appointment] = await db
        .update(appointments)
        .set({ checkin: true })
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.establishmentId, ctx.establishmentId),
          ),
        )
        .returning();

      return appointment;
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
        date: z.coerce.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { serviceId, employeeId, establishmentId, date } = input;
      const { db } = ctx;

      console.log("=== INÍCIO DA REQUISIÇÃO ===");
      console.log("Input:", {
        serviceId,
        employeeId,
        establishmentId,
        date: date.toLocaleString(),
        defaultDate: date,
      });

      const dayOfWeek = date.getDay();
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
          gte(appointments.startTime, startOfDay(date)),
          lte(appointments.endTime, endOfDay(date)),
          employeeId ? eq(appointments.employeeId, employeeId) : undefined,
          eq(appointments.establishmentId, establishmentId),
        ),
      });

      console.log(
        "Agendamentos existentes:",
        existingAppointments.length,
        existingAppointments.map((a) => ({
          start: a.startTime.toISOString(),
          end: a.endTime.toISOString(),
        })),
      );

      // 5. Gerar slots disponíveis
      const slots = [];
      console.log("Processando intervalos:", openingHoursResult.intervals);

      for (const interval of openingHoursResult.intervals.length > 0
        ? openingHoursResult.intervals
        : [
            {
              startTime: openingHoursResult.openingTime,
              endTime: openingHoursResult.closingTime,
            },
          ]) {
        const intervalStart = parse(interval.startTime, "HH:mm:ss", date);
        const intervalEnd = parse(interval.endTime, "HH:mm:ss", date);

        console.log("\nProcessando intervalo:", {
          start: intervalStart.toISOString(),
          end: intervalEnd.toISOString(),
        });

        let currentSlotStart = intervalStart;
        let slotCount = 0;

        while (currentSlotStart < intervalEnd) {
          const slotEnd = addMinutes(currentSlotStart, service.duration);
          slotCount++;

          console.log(`\nSlot ${slotCount}:`, {
            currentSlotStart: currentSlotStart.toISOString(),
            slotEnd: slotEnd.toISOString(),
            serviceDuration: service.duration,
          });

          if (slotEnd > intervalEnd) {
            console.log("Slot ultrapassa intervalo - pulando");
            currentSlotStart = addMinutes(currentSlotStart, 15);
            continue;
          }

          // Verificar conflitos
          const hasConflict = existingAppointments.some((appointment) => {
            const conflict =
              appointment.startTime < slotEnd &&
              appointment.endTime > currentSlotStart;
            if (conflict)
              console.log(
                "Conflito encontrado com agendamento:",
                appointment.id,
              );
            return conflict;
          });

          // Verificar indisponibilidades
          const isUnavailable = employeeUnavailabilities.some((ua) => {
            if (!ua.startTime || !ua.endTime) return false;

            const uaStart = parse(ua.startTime, "HH:mm:ss", date);
            const uaEnd = parse(ua.endTime, "HH:mm:ss", date);

            const unavailable = currentSlotStart < uaEnd && slotEnd > uaStart;
            if (unavailable)
              console.log("Conflito com indisponibilidade:", ua.id);
            return unavailable;
          });

          slots.push({
            start: currentSlotStart,
            end: slotEnd,
            available: !hasConflict && !isUnavailable,
            reason: hasConflict
              ? "Horário já agendado"
              : isUnavailable
                ? "Funcionário indisponível"
                : undefined,
          });

          console.log("Slot adicionado:", {
            start: currentSlotStart.toISOString(),
            end: slotEnd.toISOString(),
            available: !hasConflict && !isUnavailable,
            reason: hasConflict
              ? "Conflito"
              : isUnavailable
                ? "Indisponível"
                : "Disponível",
          });

          currentSlotStart = addMinutes(
            currentSlotStart,
            Math.max(15, service.duration),
          );
        }
      }

      // Verificação de data/hora atual
      const now = new Date();
      const isToday =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

      console.log("\nFiltro final:");
      console.log("Data atual:", now.toISOString());
      console.log("É hoje?", isToday);
      console.log("Slots antes do filtro:", slots.length);

      const filteredSlots = slots.filter((slot) => {
        const isFutureSlot = !isToday || slot.start >= now;
        if (!isFutureSlot)
          console.log("Slot removido (passado):", slot.start.toISOString());
        return slot.available && isFutureSlot;
      });

      console.log("Slots após filtro:", filteredSlots.length);
      console.log("=== FIM DA REQUISIÇÃO ===\n");

      return {
        service,
        date,
        openingHours: {
          openingTime: openingHoursResult.openingTime,
          closingTime: openingHoursResult.closingTime,
        },
        availableSlots: filteredSlots,
      };
    }),
};
