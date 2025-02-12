import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, eq } from "@acme/db";
import { db } from "@acme/db/client";
import { appointments, storeHours } from "@acme/db/schema";
import { daysOfWeek } from "@acme/utils";
import { storeHoursSchema } from "@acme/validators";

import { protectedProcedure } from "../trpc";

export const storeHoursRoute = {
  all: protectedProcedure.query(async ({ ctx }) => {
    const hours = await ctx.db.query.storeHours.findMany({
      where: (table, { eq }) => eq(table.storeId, ctx.storeId),
    });

    return hours;
  }),

  getDayHours: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const dayOfWeek = daysOfWeek[input];

      if (!dayOfWeek) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Day of week not found",
        });
      }

      console.log(dayOfWeek);

      const result = await ctx.db.query.storeHours.findFirst({
        where: and(
          eq(storeHours.storeId, ctx.storeId),
          eq(storeHours.dayOfWeek, dayOfWeek),
        ),
      });

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Day hours not found",
        });
      }

      return result;
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
