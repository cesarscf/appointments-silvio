import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { appointments } from "@acme/db/schema";
import { createAppointmentSchema } from "@acme/validators";

import { protectedProcedure } from "../trpc";

export const appointmentRouter = {
  all: protectedProcedure.query(async ({ ctx }) => {
    const results = await db.query.appointments.findMany({
      where: eq(appointments.storeId, ctx.storeId),
    });

    return results;
  }),

  create: protectedProcedure
    .input(createAppointmentSchema)
    .mutation(async ({ ctx, input }) => {
      const appointment = await db.insert(appointments).values({
        ...input,
        storeId: ctx.storeId,
      });

      return appointment;
    }),
};
