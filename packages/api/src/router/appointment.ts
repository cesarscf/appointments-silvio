import {
  addDays,
  addMinutes,
  differenceInMinutes,
  endOfDay,
  format,
  isWithinInterval,
  parse,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { z } from "zod";

import { and, eq, gte, isNull, lt, lte, or } from "@acme/db";
import { db } from "@acme/db/client";
import { appointments } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const appointmentRouter = {
  listAppointments: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.query.appointments.findMany({
      where: eq(appointments.establishmentId, ctx.establishmentId),
      with: {
        employee: true,
        service: true,
        customer: true,
      },
    });

    return data;
  }),

  createAppointment: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().uuid(),
        serviceId: z.string().uuid(),
        customerId: z.string().uuid(),
        startTime: z.date(),
        endTime: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newAppointment = await ctx.db.insert(appointments).values({
        ...input,
        establishmentId: ctx.establishmentId,
        status: "scheduled",
        checkin: false,
      });

      return newAppointment;
    }),

  updateAppointmentStatus: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string().uuid(),
        status: z.enum(["scheduled", "completed"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedAppointment = await ctx.db
        .update(appointments)
        .set({ status: input.status })
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.establishmentId, ctx.establishmentId),
          ),
        );

      return updatedAppointment;
    }),

  checkInAppointment: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedAppointment = await ctx.db
        .update(appointments)
        .set({ checkin: true })
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.establishmentId, ctx.establishmentId),
          ),
        );

      await ctx.db
        .update(appointments)
        .set({ status: "completed" })
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.establishmentId, ctx.establishmentId),
          ),
        );

      return updatedAppointment;
    }),

  listAppointmentsByPeriod: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.query.appointments.findMany({
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

      return data;
    }),

  cancelAppointment: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedAppointment = await ctx.db
        .delete(appointments)
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.establishmentId, ctx.establishmentId),
          ),
        );

      return deletedAppointment;
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

      // 1. Buscar informações do serviço (duração)
      const service = await db.query.services.findFirst({
        where: (services, { eq }) => eq(services.id, serviceId),
      });

      if (!service) {
        throw new Error("Serviço não encontrado");
      }

      // 2. Buscar horário de funcionamento para esse dia
      const openingHours = await db.query.openingHours.findFirst({
        where: (openingHours, { eq }) =>
          and(
            eq(openingHours.establishmentId, establishmentId),
            eq(openingHours.dayOfWeek, dayOfWeek),
          ),
        with: {
          intervals: true,
        },
      });

      if (!openingHours) {
        return {
          available: false,
          message: "Estabelecimento não funciona neste dia",
          slots: [],
        };
      }

      // 3. Buscar indisponibilidades do funcionário
      const employeeUnavailabilities = employeeId
        ? await db.query.unavailabilities.findMany({
            where: (unavailabilities, { eq }) =>
              and(
                eq(unavailabilities.employeeId, employeeId),
                or(
                  eq(unavailabilities.dayOfWeek, dayOfWeek),
                  isNull(unavailabilities.dayOfWeek),
                ),
              ),
          })
        : [];

      const test = await db.query.unavailabilities.findMany({
        where: (table, { eq }) => eq(table.employeeId, employeeId!),
      });

      console.log("xxx ======>", test, employeeId);

      // 4. Buscar agendamentos existentes
      const existingAppointments = await db.query.appointments.findMany({
        where: and(
          gte(appointments.startTime, startOfDay(date)),
          lte(appointments.endTime, endOfDay(date)),
          employeeId ? eq(appointments.employeeId, employeeId) : undefined,
          eq(appointments.serviceId, serviceId),
        ),
      });

      // 5. Gerar slots disponíveis
      const slots: {
        start: Date;
        end: Date;
        available: boolean;
        reason?: string;
      }[] = [];

      // Converter horário de abertura/fechamento para Date
      const openingTime = parse(openingHours.openingTime, "HH:mm:ss", date);
      const closingTime = parse(openingHours.closingTime, "HH:mm:ss", date);

      // Intervalos de descanso/configuração
      const intervals =
        openingHours.intervals.length > 0
          ? openingHours.intervals
          : [
              {
                startTime: openingHours.openingTime,
                endTime: openingHours.closingTime,
              },
            ];

      // Processar cada intervalo do dia
      for (const interval of intervals) {
        const intervalStart = parse(interval.startTime, "HH:mm:ss", date);
        const intervalEnd = parse(interval.endTime, "HH:mm:ss", date);

        let currentSlotStart = intervalStart;

        while (currentSlotStart < intervalEnd) {
          const slotEnd = addMinutes(currentSlotStart, service.duration);

          // Verificar se o slot ultrapassa o horário de fechamento
          if (slotEnd > intervalEnd) {
            currentSlotStart = addMinutes(currentSlotStart, 15); // Incremento padrão
            continue;
          }

          // Verificar conflitos com agendamentos existentes
          const hasConflict = existingAppointments.some((appointment) => {
            return (
              appointment.startTime < slotEnd &&
              appointment.endTime > currentSlotStart
            );
          });

          // Verificar indisponibilidades do funcionário
          const isUnavailable = employeeUnavailabilities.some(
            (unavailability) => {
              if (!unavailability.startTime || !unavailability.endTime)
                return false;

              const unavailabilityStart = parse(
                unavailability.startTime,
                "HH:mm:ss",
                date,
              );
              const unavailabilityEnd = parse(
                unavailability.endTime,
                "HH:mm:ss",
                date,
              );

              return (
                currentSlotStart < unavailabilityEnd &&
                slotEnd > unavailabilityStart
              );
            },
          );

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

          // Avançar para o próximo slot (15 minutos ou duração do serviço)
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
          openingTime: openingHours.openingTime,
          closingTime: openingHours.closingTime,
        },
        availableSlots: slots.filter((slot) => slot.available),
        allSlots: slots, // Para debug ou exibição completa
      };
    }),
};
