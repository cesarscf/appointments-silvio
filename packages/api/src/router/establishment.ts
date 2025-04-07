import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import { establishments } from "@acme/db/schema";
import { slugify } from "@acme/utils";
import { updateEstablishmentSchema } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const establishmentRouter = {
  getEstablishmentBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const establishment = await ctx.db.query.establishments.findFirst({
        where: (table, { eq }) => eq(table.slug, input.slug),
        with: {
          categories: true,
          employees: {
            where: (employee, { eq }) => eq(employee.active, true),
          },
          services: {
            where: (service, { eq }) => eq(service.active, true),
          },
        },
      });

      if (!establishment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Error ao encontrar a loja.",
        });
      }

      return establishment;
    }),

  getEstablishmentById: protectedProcedure.query(async ({ ctx }) => {
    const [establishment] = await ctx.db
      .select()
      .from(establishments)
      .where(eq(establishments.userId, ctx.session.user.id));

    if (!establishment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Error ao encontrar a loja.",
      });
    }

    return establishment;
  }),
  createEstablishment: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      const slug = slugify(name);

      const [establishment] = await ctx.db
        .insert(establishments)
        .values({ name, slug, userId: ctx.session.user.id })
        .returning();

      return establishment;
    }),
  listEstablishments: protectedProcedure.query(async ({ ctx }) => {
    const establishmentsList = await ctx.db.select().from(establishments);

    return establishmentsList;
  }),

  updateEstablishment: protectedProcedure
    .input(updateEstablishmentSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(establishments)
        .set({
          ...input,
        })
        .where(eq(establishments.id, ctx.establishmentId));
    }),
};
