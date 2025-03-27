import { z } from "zod";

import { eq } from "@acme/db";
import { customers } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const customerRouter = {
  listCustomers: protectedProcedure.query(async ({ ctx }) => {
    const customersList = await ctx.db
      .select()
      .from(customers)
      .where(eq(customers.establishmentId, ctx.establishmentId));
    return customersList;
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
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().optional(),
        cpf: z.string().optional(),
        birthDate: z.coerce.date().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
      }),
    )
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
        .set(data)
        .where(eq(customers.id, id))
        .returning();

      if (!updatedCustomer) {
        throw new Error("Erro ao atualizar o cliente.");
      }

      return updatedCustomer;
    }),

  createCustomer: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        cpf: z.string(),
        birthDate: z.coerce.date(),
        phoneNumber: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, cpf, birthDate, phoneNumber, email, address } = input;

      const [newCustomer] = await ctx.db
        .insert(customers)
        .values({
          name,
          cpf,
          birthDate,
          phoneNumber,
          email,
          address,
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
