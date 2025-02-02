import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { clients } from "@acme/db/schema";
import { createClientSchema, updateClientSchema } from "@acme/validators";

import { protectedProcedure } from "../trpc";

export const clientRoute = {
  all: protectedProcedure.query(async ({ ctx }) => {
    const clients = await db.query.clients.findMany({
      where: (table, { eq }) => eq(table.storeId, ctx.storeId),
    });

    return clients;
  }),

  create: protectedProcedure
    .input(createClientSchema)
    .mutation(async ({ input, ctx }) => {
      const [client] = await db
        .insert(clients)
        .values({
          name: input.name,
          birthDate: input.birthday,
          phone: input.phone,
          storeId: ctx.storeId,
          address: input.address ?? "",
          cpf: input.cpf ?? "",
          email: input.email ?? "",
        })
        .returning({
          id: clients.id,
        });

      if (!client) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create client",
        });
      }

      return client;
    }),

  update: protectedProcedure
    .input(
      updateClientSchema.extend({
        clientId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [client] = await db
        .update(clients)
        .set({ ...input })
        .where(eq(clients.id, input.clientId))
        .returning({
          id: clients.id,
        });

      if (!client) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update client",
        });
      }

      return client;
    }),

  delete: protectedProcedure
    .input(z.object({ clientId: z.string() }))
    .mutation(async ({ input }) => {
      const [client] = await db
        .delete(clients)
        .where(eq(clients.id, input.clientId))
        .returning({ id: clients.id });

      return client;
    }),
};
