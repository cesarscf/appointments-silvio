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
import { publicCreateAppointmentSchema } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

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
          eq(customers.phoneNumber, input.customer.phoneNumber),
          eq(customers.cpf, input.customer.cpf),
        ),
      });

      if (!customer) {
        [customer] = await db
          .insert(customers)
          .values({
            ...input.customer,
            establishmentId: input.establishmentId,
          })
          .returning();
      } else {
        await db
          .update(customers)
          .set(input.customer)
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
        date: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const { serviceId, employeeId, establishmentId, date } = input;
      const dayOfWeek = date.getDay(); // 0 (Domingo) a 6 (Sábado)

      // 1. Buscar informações do serviço
      const service = await db.query.services.findFirst({
        where: eq(services.id, serviceId),
      });

      if (!service) {
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

      if (!openingHoursResult) {
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

      // 4. Buscar agendamentos existentes
      const existingAppointments = await db.query.appointments.findMany({
        where: and(
          gte(appointments.startTime, startOfDay(date)),
          lte(appointments.endTime, endOfDay(date)),
          employeeId ? eq(appointments.employeeId, employeeId) : undefined,
          eq(appointments.establishmentId, establishmentId),
        ),
      });

      // 5. Gerar slots disponíveis
      const slots: {
        start: Date;
        end: Date;
        available: boolean;
        reason?: string;
      }[] = [];

      // Processar cada intervalo do dia
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

        let currentSlotStart = intervalStart;

        while (currentSlotStart < intervalEnd) {
          const slotEnd = addMinutes(currentSlotStart, service.duration);

          // Verificar se o slot ultrapassa o intervalo
          if (slotEnd > intervalEnd) {
            currentSlotStart = addMinutes(currentSlotStart, 15);
            continue;
          }

          // Verificar conflitos com agendamentos
          const hasConflict = existingAppointments.some((appointment) => {
            return (
              appointment.startTime < slotEnd &&
              appointment.endTime > currentSlotStart
            );
          });

          // Verificar indisponibilidades
          const isUnavailable = employeeUnavailabilities.some((ua) => {
            if (!ua.startTime || !ua.endTime) return false;

            const uaStart = parse(ua.startTime, "HH:mm:ss", date);
            const uaEnd = parse(ua.endTime, "HH:mm:ss", date);

            return currentSlotStart < uaEnd && slotEnd > uaStart;
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

          currentSlotStart = addMinutes(
            currentSlotStart,
            Math.max(15, service.duration),
          );
        }
      }

      return {
        service,
        date,
        openingHours: {
          openingTime: openingHoursResult.openingTime,
          closingTime: openingHoursResult.closingTime,
        },
        availableSlots: slots.filter((slot) => slot.available),
      };
    }),
};
