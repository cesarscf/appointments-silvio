import { z } from "zod";

import { eq } from "@acme/db";
import { employees } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const employeeRouter = {
  addEmployee: protectedProcedure
    .input(
      z.object({
        establishmentId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { establishmentId, name } = input;

      const [employee] = await ctx.db
        .insert(employees)
        .values({ establishmentId, name })
        .returning();

      return employee;
    }),
  listEmployeesByEstablishment: protectedProcedure
    .input(
      z.object({
        establishmentId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { establishmentId } = input;

      const employeesList = await ctx.db
        .select()
        .from(employees)
        .where(eq(employees.establishmentId, establishmentId));

      return employeesList;
    }),
};
