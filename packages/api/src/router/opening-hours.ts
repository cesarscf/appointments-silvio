import { z } from "zod";

import { and, eq } from "@acme/db";
import { establishments, intervals, openingHours } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const openingHoursRouter = {
  listOpeningHoursByEstablishment: protectedProcedure.query(async ({ ctx }) => {
    const { establishmentId } = ctx;

    const openingHoursData = await ctx.db.query.openingHours.findMany({
      where: eq(openingHours.establishmentId, establishmentId),
      with: { intervals: true },
    });

    return openingHoursData;
  }),
  update: protectedProcedure
    .input(
      z.array(
        z.object({
          dayOfWeek: z.number().min(0).max(6),
          openingTime: z.string(),
          closingTime: z.string(),
          intervals: z.array(
            z.object({
              startTime: z.string(),
              endTime: z.string(),
            }),
          ),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const establishment = await ctx.db.query.establishments.findFirst({
        where: and(eq(establishments.id, ctx.establishmentId)),
      });

      if (!establishment) {
        throw new Error("Não autorizado");
      }

      await ctx.db.transaction(async (trx) => {
        await trx
          .delete(openingHours)
          .where(eq(openingHours.establishmentId, ctx.establishmentId));

        for (const hour of input) {
          const [newHour] = await trx
            .insert(openingHours)
            .values({
              establishmentId: ctx.establishmentId,
              dayOfWeek: hour.dayOfWeek,
              openingTime: hour.openingTime,
              closingTime: hour.closingTime,
            })
            .returning();

          if (hour.intervals.length > 0) {
            await trx.insert(intervals).values(
              hour.intervals.map((interval) => ({
                openingHourId: newHour!.id,
                startTime: interval.startTime,
                endTime: interval.endTime,
              })),
            );
          }
        }
      });

      return { success: true };
    }),
};
