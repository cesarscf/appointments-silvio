import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import { establishments, services } from "@acme/db/schema";
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
          servicePackages: {
            where: (table, { eq }) => eq(table.active, true),
            with: {
              service: true,
            },
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
          phone: input.phone ? input.phone.replace(/\D/g, "") : undefined,
        })
        .where(eq(establishments.id, ctx.establishmentId));
    }),

  getOnboardingCheck: protectedProcedure.query(async ({ ctx }) => {
    const servicesResult = await ctx.db.query.services.findMany({
      where: eq(services.establishmentId, ctx.establishmentId),
    });

    const categoriesResult = await ctx.db.query.categories.findMany({
      where: eq(services.establishmentId, ctx.establishmentId),
    });

    const employeesResult = await ctx.db.query.employees.findMany({
      where: eq(services.establishmentId, ctx.establishmentId),
    });

    return {
      serviceCreated: servicesResult.length > 0,
      categoryCreated: categoriesResult.length > 0,
      employeeCreated: employeesResult.length > 0,
    };
  }),
};
