import { z } from "zod";

import { eq } from "@acme/db";
import { serviceCategories } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const serviceCategoryRouter = {
  addServiceCategory: protectedProcedure
    .input(
      z.object({
        serviceId: z.string(),
        categoryId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { serviceId, categoryId } = input;

      const [serviceCategory] = await ctx.db
        .insert(serviceCategories)
        .values({ serviceId, categoryId })
        .returning();

      return serviceCategory;
    }),
  listServicesByCategory: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { categoryId } = input;

      const servicesList = await ctx.db
        .select()
        .from(serviceCategories)
        .where(eq(serviceCategories.categoryId, categoryId));

      return servicesList;
    }),
};
