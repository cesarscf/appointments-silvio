import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, eq } from "@acme/db";
import { db } from "@acme/db/client";
import { appointments, clients } from "@acme/db/schema";
import { createAppointmentSchema, createClientSchema } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const appointmentRouter = {
  all: protectedProcedure.query(async ({ ctx }) => {
    const results = await db.query.appointments.findMany({
      where: eq(appointments.storeId, ctx.storeId),
      with: {
        client: true,
        employee: true,
        service: true,
      },
    });

    return results;
  }),

  create: protectedProcedure
    .input(createAppointmentSchema)
    .mutation(async ({ ctx, input }) => {
      const appointment = await db.insert(appointments).values({
        ...input,
        storeId: ctx.storeId,
      });

      return appointment;
    }),

  createPublic: publicProcedure
    .input(
      z.object({
        oppointment: createAppointmentSchema.omit({ clientId: true }),
        client: createClientSchema,
        storeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let client;

      const clientExists = await ctx.db.query.clients.findFirst({
        where: (table, { eq, and }) =>
          and(
            eq(table.storeId, input.storeId),
            eq(table.phone, input.client.phone),
          ),
      });

      if (clientExists) {
        client = clientExists;
      } else {
        [client] = await db
          .insert(clients)
          .values({
            name: input.client.name,
            birthDate: input.client.birthday,
            phone: input.client.phone,
            storeId: input.storeId,
            address: input.client.address ?? "",
            cpf: input.client.cpf ?? "",
            email: input.client.email ?? "",
          })
          .returning({
            id: clients.id,
          });
      }

      if (!client) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create client",
        });
      }

      const result = await db
        .insert(appointments)
        .values({
          checkIn: false,
          clientId: client.id,
          date: input.oppointment.date,
          employeeId: input.oppointment.employeeId,
          serviceId: input.oppointment.serviceId,
          status: "AGENDADO",
          storeId: input.storeId,
        })
        .returning({
          id: appointments.id,
        });

      return result;
    }),
};
