import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { stores } from "@acme/db/schema";
import { updateStoreSchema } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const storeRoute = {
  getByUserId: protectedProcedure.query(async ({ ctx }) => {
    const org = await db.query.stores.findFirst({
      where: (table, { eq }) => eq(table.userId, ctx.session.user.id),
    });

    if (!org) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }

    return org;
  }),

  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const org = await db.query.stores.findFirst({
        where: (table, { eq }) => eq(table.slug, input.slug),
        with: {
          services: {
            with: {
              category: {
                columns: {
                  name: true,
                },
              },
            },
          },
          employees: true,
          addresses: true,
        },
      });

      return org;
    }),

  getById: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ input }) => {
      const org = await db.query.stores.findFirst({
        where: (table, { eq }) => eq(table.id, input.storeId),
      });

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }

      return org;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [org] = await db
        .insert(stores)
        .values({
          name: input.name,
          slug: input.slug,
          userId: ctx.session.session.id,
        })
        .returning({
          id: stores.id,
        });

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create store",
        });
      }

      return org;
    }),

  update: protectedProcedure
    .input(updateStoreSchema)
    .mutation(async ({ input, ctx }) => {
      const [org] = await db
        .update(stores)
        .set({
          name: input.name,
          logo: input.logo,
          theme: input.theme,
          slug: input.slug,
        })
        .where(eq(stores.id, ctx.storeId))
        .returning({
          id: stores.id,
        });

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update store",
        });
      }

      return org;
    }),

  delete: protectedProcedure
    .input(z.object({ storeId: z.string() }))
    .mutation(async ({ input }) => {
      const [org] = await db
        .delete(stores)
        .where(eq(stores.id, input.storeId))
        .returning({ id: stores.id });

      if (!org) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete store",
        });
      }

      return org;
    }),
};
