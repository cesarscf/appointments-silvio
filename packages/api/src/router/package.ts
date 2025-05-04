import { TRPCError } from "@trpc/server";

import { and, eq } from "@acme/db";
import {
  packageAppointments,
  servicePackages,
  services,
} from "@acme/db/schema";
import { servicePackageSchema } from "@acme/validators";

import type { TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../trpc";

export const packageRouter = {
  create: protectedProcedure
    .input(servicePackageSchema)
    .mutation(async ({ ctx, input }) => {
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

      const [newServicePackages] = await ctx.db
        .insert(servicePackages)
        .values({
          active: true,
          commission: String(input.commission),
          name: input.name,
          establishmentId: ctx.establishmentId,
          packagePrice: String(input.packagePrice),
          quantity: input.quantity,
          serviceId: input.serviceId,
          description: input.description,
        })
        .returning();

      return newServicePackages;
    }),

  getAll: protectedProcedure.query(async ({ ctx, input }) => {
    const result = await ctx.db.query.servicePackages.findMany({
      where: and(eq(servicePackages.establishmentId, ctx.establishmentId)),
      with: {
        service: true,
      },
      orderBy: (programs, { desc }) => [desc(programs.createdAt)],
    });

    return result;
  }),
} satisfies TRPCRouterRecord;
