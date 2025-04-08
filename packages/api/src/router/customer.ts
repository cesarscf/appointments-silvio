import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eq } from "@acme/db";
import { customers } from "@acme/db/schema";
import { clearNumber } from "@acme/utils";
import { createCustomerSchema, updateCustomerSchema } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const customerRouter = {
  listCustomers: protectedProcedure.query(async ({ ctx }) => {
    const customersList = await ctx.db
      .select()
      .from(customers)
      .where(eq(customers.establishmentId, ctx.establishmentId));

    return customersList;
  }),

  getCustomerById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.customers.findFirst({
        where: eq(customers.id, input.id),
      });

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cliente não encontrado.",
        });
      }

      return result;
    }),

  listCustomerAppointments: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.appointments.findMany({
        where: eq(customers.id, input.id),
        with: {
          employee: true,
          service: true,
          customer: true,
        },
        orderBy: (appointments, { desc }) => [desc(appointments.startTime)],
      });

      return result;
    }),
  deleteCustomer: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const customer = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.id, id))
        .limit(1);

      if (!customer[0]) {
        throw new Error("Cliente não encontrado.");
      }

      await ctx.db.delete(customers).where(eq(customers.id, id));

      return { success: true, message: "Cliente excluído com sucesso." };
    }),

  updateCustomer: protectedProcedure
    .input(updateCustomerSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      const customer = await ctx.db
        .select()
        .from(customers)
        .where(eq(customers.id, id))
        .limit(1);

      if (!customer[0]) {
        throw new Error("Cliente não encontrado.");
      }

      const [updatedCustomer] = await ctx.db
        .update(customers)
        .set({
          ...data,
          cpf: clearNumber(input.cpf ?? ""),
          phoneNumber: clearNumber(input.phoneNumber ?? ""),
        })
        .where(eq(customers.id, id))
        .returning();

      if (!updatedCustomer) {
        throw new Error("Erro ao atualizar o cliente.");
      }

      return updatedCustomer;
    }),

  createCustomer: protectedProcedure
    .input(createCustomerSchema)
    .mutation(async ({ input, ctx }) => {
      const customerWithSamePhone = await ctx.db.query.customers.findFirst({
        where: eq(customers.phoneNumber, clearNumber(input.phoneNumber)),
      });

      if (customerWithSamePhone) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
          message: "Um cliente com esse numero já foi cadastrado",
        });
      }

      const [newCustomer] = await ctx.db
        .insert(customers)
        .values({
          name: input.name,
          birthDate: input.birthDate,
          phoneNumber: clearNumber(input.phoneNumber),
          cpf: clearNumber(input.cpf ?? ""),
          email: input.email ?? "",
          address: input.address ?? "",
          establishmentId: ctx.establishmentId,
        })
        .returning();

      if (!newCustomer) {
        throw new Error("Erro ao criar o cliente.");
      }

      return newCustomer;
    }),

  getCustomerByPhone: publicProcedure
    .input(z.object({ phone: z.string() }))
    .query(async ({ ctx, input }) => {
      const { phone } = input;

      return await ctx.db.query.customers.findFirst({
        where: (table, { eq }) => eq(table.phoneNumber, phone),
      });
    }),
};
