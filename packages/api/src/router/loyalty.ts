import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { establishments, loyaltyPrograms, services } from "@acme/db/schema";
import { loyaltyProgramSchema } from "@acme/validators";

import { protectedProcedure } from "../trpc";

export const loyaltyRouter = {
  create: protectedProcedure
    .input(loyaltyProgramSchema.omit({ id: true, establishmentId: true }))
    .mutation(async ({ ctx, input }) => {
      const establishment = await ctx.db.query.establishments.findFirst({
        where: and(
          eq(establishments.id, ctx.establishmentId),
          eq(establishments.userId, ctx.session.user.id),
        ),
      });

      if (!establishment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão neste estabelecimento",
        });
      }

      const mainService = await ctx.db.query.services.findFirst({
        where: and(
          eq(services.id, input.serviceId),
          eq(services.establishmentId, ctx.establishmentId),
        ),
      });

      if (!mainService) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Serviço principal não encontrado",
        });
      }

      const bonusService = await ctx.db.query.services.findFirst({
        where: and(
          eq(services.id, input.bonusServiceId),
          eq(services.establishmentId, ctx.establishmentId),
        ),
      });

      if (!bonusService) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Serviço bônus não encontrado",
        });
      }

      const [newProgram] = await ctx.db
        .insert(loyaltyPrograms)
        .values({
          ...input,
          establishmentId: ctx.establishmentId,
          pointsPerService: input.pointsPerService,
          requiredPoints: input.requiredPoints,
          bonusQuantity: input.bonusQuantity,
        })
        .returning();

      return newProgram;
    }),

  update: protectedProcedure
    .input(loyaltyProgramSchema)
    .mutation(async ({ ctx, input }) => {
      const existingProgram = await ctx.db.query.loyaltyPrograms.findFirst({
        where: and(
          eq(loyaltyPrograms.id, input.id!),
          eq(loyaltyPrograms.establishmentId, input.establishmentId),
        ),
        with: {
          establishment: true,
        },
      });

      if (
        !existingProgram ||
        existingProgram.establishment.userId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Programa não encontrado ou sem permissão",
        });
      }

      const [updatedProgram] = await ctx.db
        .update(loyaltyPrograms)
        .set({
          ...input,
        })
        .where(eq(loyaltyPrograms.id, input.id!))
        .returning();

      return updatedProgram;
    }),

  getAll: protectedProcedure.query(async ({ ctx, input }) => {
    return await ctx.db.query.loyaltyPrograms.findMany({
      where: and(eq(loyaltyPrograms.establishmentId, ctx.establishmentId)),
      with: {
        service: true,
        bonusService: true,
      },
      orderBy: (programs, { desc }) => [desc(programs.createdAt)],
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.query.loyaltyPrograms.findFirst({
        where: eq(loyaltyPrograms.id, input.id),
        with: {
          service: true,
          bonusService: true,
          establishment: true,
        },
      });

      if (!program || program.establishment.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Programa não encontrado",
        });
      }

      return program;
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string().uuid(), active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const program = await ctx.db.query.loyaltyPrograms.findFirst({
        where: eq(loyaltyPrograms.id, input.id),
        with: {
          establishment: true,
        },
      });

      if (!program || program.establishment.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Sem permissão para alterar este programa",
        });
      }

      const [updated] = await ctx.db
        .update(loyaltyPrograms)
        .set({ active: input.active })
        .where(eq(loyaltyPrograms.id, input.id))
        .returning();

      return updated;
    }),
};
