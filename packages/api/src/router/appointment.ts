import { z } from "zod";

import { and, eq, gte, lt, lte, or } from "@acme/db";
import { db } from "@acme/db/client";
import { appointments } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

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
};
