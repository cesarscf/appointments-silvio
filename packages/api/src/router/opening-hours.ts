import { z } from "zod";

import { eq } from "@acme/db";
import { openingHours } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const openingHoursRouter = {
  listOpeningHoursByEstablishment: protectedProcedure.query(
    async ({ input, ctx }) => {
      const { establishmentId } = ctx;

      const openingHoursList = await ctx.db
        .select()
        .from(openingHours)
        .where(eq(openingHours.establishmentId, establishmentId));

      return openingHoursList;
    },
  ),
};
