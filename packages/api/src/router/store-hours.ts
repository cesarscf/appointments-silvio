import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { storeHours } from "@acme/db/schema";
import { storeHoursSchema } from "@acme/validators";

import { protectedProcedure } from "../trpc";

export const storeHoursRoute = {
  all: protectedProcedure.query(async ({ ctx }) => {
    const hours = await ctx.db.query.storeHours.findMany({
      where: (table, { eq }) => eq(table.storeId, ctx.storeId),
    });

    return hours;
  }),

  update: protectedProcedure
    .input(storeHoursSchema)
    .mutation(async ({ ctx, input }) => {
      await db.delete(storeHours).where(eq(storeHours.storeId, ctx.storeId));

      await db.insert(storeHours).values(
        input.map((it) => ({
          storeId: ctx.storeId,
          openClose: it.openTime,
          closeTime: it.closeTime,
          breakStart: it.breakStart,
          breakEnd: it.breakEnd,
          dayOfWeek: it.dayOfWeek,
          active: it.active,
        })),
      );
    }),
};
