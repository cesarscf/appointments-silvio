import { z } from "zod";

import { eq } from "@acme/db";
import { categories, establishments } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const categoryRouter = {
  listCategories: protectedProcedure.query(async ({ ctx }) => {
    const categoriesList = await ctx.db.select().from(categories);
    return categoriesList;
  }),

  deleteCategory: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const category = await ctx.db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

      if (!category[0]) {
        throw new Error("Categoria não encontrada");
      }

      await ctx.db.delete(categories).where(eq(categories.id, id));

      return { success: true, message: "Categoria excluída com sucesso" };
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name } = input;

      const category = await ctx.db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

      if (!category[0]) {
        throw new Error("Categoria não encontrada");
      }

      const [updatedCategory] = await ctx.db
        .update(categories)
        .set({ name })
        .where(eq(categories.id, id))
        .returning();

      return updatedCategory;
    }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      const [newCategory] = await ctx.db
        .insert(categories)
        .values({
          name,
          establishmentId: ctx.establishmentId,
        })
        .returning();

      if (!newCategory) {
        throw new Error("Erro ao criar a categoria");
      }

      return newCategory;
    }),
};
