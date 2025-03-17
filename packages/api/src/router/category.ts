import { z } from "zod";

import { categories, establishments } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const categoryRouter = {
  addCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      const [category] = await ctx.db
        .insert(categories)
        .values({ name })
        .returning();

      return category;
    }),
  listCategories: protectedProcedure.query(async ({ ctx }) => {
    const categoriesList = await ctx.db.select().from(categories);

    return categoriesList;
  }),
};
