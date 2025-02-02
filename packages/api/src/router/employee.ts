import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, eq } from "@acme/db";
import { db } from "@acme/db/client";
import { employees, employeeServices } from "@acme/db/schema";
import {
  createEmployeeSchema,
  createEmployeeServiceSchema,
  updateEmployeeSchema,
} from "@acme/validators";

import { protectedProcedure } from "../trpc";

export const employeeRoute = {
  all: protectedProcedure.query(async ({ ctx }) => {
    const data = await db.query.employees.findMany({
      where: eq(employees.storeId, ctx.storeId),
    });

    return data;
  }),

  getById: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const employee = await db.query.employees.findFirst({
        where: and(
          eq(employees.id, input.employeeId),
          eq(employees.storeId, ctx.storeId),
        ),
        with: {
          employeeServices: {
            with: {
              service: true,
            },
          },
        },
      });

      if (!employee) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get employee",
        });
      }

      return employee;
    }),

  create: protectedProcedure
    .input(createEmployeeSchema)
    .mutation(async ({ input, ctx }) => {
      const [employee] = await db
        .insert(employees)
        .values({ ...input, storeId: ctx.storeId })
        .returning({ id: employees.id });

      if (!employee) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create employee",
        });
      }

      return employee;
    }),

  update: protectedProcedure
    .input(
      updateEmployeeSchema.extend({
        employeeId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [employee] = await db
        .update(employees)
        .set({ ...input })
        .where(
          and(
            eq(employees.id, input.employeeId),
            eq(employees.storeId, ctx.storeId),
          ),
        )
        .returning({ id: employees.id });

      if (!employee) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update employee",
        });
      }

      return employee;
    }),

  createEmployeeService: protectedProcedure
    .input(createEmployeeServiceSchema)
    .mutation(async ({ input }) => {
      const data = await db
        .insert(employeeServices)
        .values({
          commission: input.commission,
          employeeId: input.employeeId,
          serviceId: input.serviceId,
        })
        .returning({ id: employeeServices.id });

      console.log(data);

      if (!data.length) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create employee services",
        });
      }

      return data;
    }),

  deleteEmployeeService: protectedProcedure
    .input(
      z.object({
        employeeServiceId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [data] = await db
        .delete(employeeServices)
        .where(eq(employeeServices.id, input.employeeServiceId))
        .returning({ id: employeeServices.id });

      if (!data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete employee service",
        });
      }

      return data;
    }),
};
