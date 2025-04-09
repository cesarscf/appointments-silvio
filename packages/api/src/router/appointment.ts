import { addMinutes, endOfDay, parse, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
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
        date: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { serviceId, employeeId, establishmentId, date } = input;
      const { db } = ctx;
      const timeZone = "America/Sao_Paulo"; // Altere para o fuso correto ou busque do banco

      // Converter datas para o fuso horário do estabelecimento
      const zonedDate = toZonedTime(date, timeZone);
      const dayOfWeek = zonedDate.getDay();

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
          gte(appointments.startTime, startOfDay(zonedDate)),
          lte(appointments.endTime, endOfDay(zonedDate)),
          employeeId ? eq(appointments.employeeId, employeeId) : undefined,
          eq(appointments.establishmentId, establishmentId),
        ),
      });

      // 5. Gerar slots disponíveis
      const slots: Array<{
        start: Date;
        end: Date;
        available: boolean;
        reason?: string;
      }> = [];
      const intervals =
        openingHoursResult.intervals.length > 0
          ? openingHoursResult.intervals
          : [
              {
                startTime: openingHoursResult.openingTime,
                endTime: openingHoursResult.closingTime,
              },
            ];

      for (const interval of intervals) {
        const intervalStart = parse(interval.startTime, "HH:mm:ss", zonedDate);
        const intervalEnd = parse(interval.endTime, "HH:mm:ss", zonedDate);
        let currentSlotStart = intervalStart;

        while (currentSlotStart < intervalEnd) {
          const slotEnd = addMinutes(currentSlotStart, service.duration);

          if (slotEnd > intervalEnd) {
            currentSlotStart = addMinutes(currentSlotStart, 15);
            continue;
          }

          const hasConflict = existingAppointments.some(
            (appointment) =>
              appointment.startTime < slotEnd &&
              appointment.endTime > currentSlotStart,
          );

          const isUnavailable = employeeUnavailabilities.some((ua) => {
            if (!ua.startTime || !ua.endTime) return false;
            const uaStart = parse(ua.startTime, "HH:mm:ss", zonedDate);
            const uaEnd = parse(ua.endTime, "HH:mm:ss", zonedDate);
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

      // Filtro final com fuso horário
      const now = new Date();
      const zonedNow = toZonedTime(now, timeZone);
      const isToday = [
        zonedDate.getFullYear(),
        zonedDate.getMonth(),
        zonedDate.getDate(),
      ].every(
        (val, idx) =>
          val ===
          [zonedNow.getFullYear(), zonedNow.getMonth(), zonedNow.getDate()][
            idx
          ],
      );

      const filteredSlots = slots.filter((slot) => {
        const zonedSlotStart = toZonedTime(slot.start, timeZone);
        return slot.available && (!isToday || zonedSlotStart >= zonedNow);
      });

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
