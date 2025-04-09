import { z } from "zod";

import { and, eq } from "@acme/db";
import { employees, employeeServices, unavailabilities } from "@acme/db/schema";
import { clearNumber } from "@acme/utils";
import { createEmployeeSchema, updateEmployeeSchema } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const employeeRouter = {
  listEmployees: protectedProcedure.query(async ({ ctx }) => {
    const employeesList = await ctx.db
      .select()
      .from(employees)
      .where(eq(employees.establishmentId, ctx.establishmentId))
      .orderBy(employees.name);

    return employeesList;
  }),

  publicGetEmployeeById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      return await ctx.db.query.employees.findFirst({
        where: (table, { eq }) => eq(table.id, id),
      });
    }),

  getEmployeeById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.employees.findFirst({
        where: (table) =>
          and(
            eq(table.id, input.id),
            eq(table.establishmentId, ctx.establishmentId),
          ),

        with: {
          unavailabilities: true,
          employeeServices: {
            with: {
              service: true,
            },
          },
        },
      });

      if (!result) {
        throw new Error("Employee não encontrado.");
      }

      const services = result.employeeServices.map((employeeService) => ({
        id: employeeService.service.id,
        name: employeeService.service.name,
        price: employeeService.service.price,
        commission: employeeService.commission,
      }));

      console.log({ unavailabilities: result.unavailabilities });
      return {
        ...result,
        unavailabilities: result.unavailabilities,
        services,
      };
    }),

  createEmployee: protectedProcedure
    .input(createEmployeeSchema)
    .mutation(async ({ input, ctx }) => {
      const employeeWithSameName = await ctx.db.query.employees.findFirst({
        where: (table) => eq(table.name, input.name),
      });

      if (employeeWithSameName) {
        throw new Error("Um funcionário com esse nome já foi cadastrado.");
      }

      const [newEmployee] = await ctx.db
        .insert(employees)
        .values({
          ...input,
          establishmentId: ctx.establishmentId,
        })
        .returning();

      if (!newEmployee) {
        throw new Error("Falha ao criar o funcionário.");
      }

      // const defaultUnavailabilities = [
      //   {
      //     employeeId: newEmployee.id,
      //     dayOfWeek: 6,
      //     startTime: "00:00",
      //     endTime: "23:59",
      //   },
      //   {
      //     employeeId: newEmployee.id,
      //     dayOfWeek: 0,
      //     startTime: "00:00",
      //     endTime: "23:59",
      //   },
      // ];

      // await ctx.db.insert(unavailabilities).values(defaultUnavailabilities);

      if (input.serviceIds.length > 0) {
        const employeeServicesData = input.serviceIds.map((serviceId) => ({
          employeeId: newEmployee.id,
          serviceId,
          commission: "0.00",
        }));

        await ctx.db.insert(employeeServices).values(employeeServicesData);
      }

      return newEmployee;
    }),

  deleteEmployee: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const employee = await ctx.db.query.employees.findFirst({
        where: (table) =>
          eq(table.id, id) && eq(table.establishmentId, ctx.establishmentId),
      });

      if (!employee) {
        throw new Error("Funcionário não encontrado.");
      }

      await ctx.db
        .delete(unavailabilities)
        .where(eq(unavailabilities.employeeId, id));

      await ctx.db
        .delete(employeeServices)
        .where(eq(employeeServices.employeeId, id));

      await ctx.db.delete(employees).where(eq(employees.id, id));

      return { success: true, message: "Funcionário excluído com sucesso." };
    }),

  addServiceToEmployee: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        serviceId: z.string(),
        commission: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { employeeId, serviceId, commission } = input;

      const employee = await ctx.db.query.employees.findFirst({
        where: (table) =>
          eq(table.id, employeeId) &&
          eq(table.establishmentId, ctx.establishmentId),
      });

      if (!employee) {
        throw new Error("Funcionário não encontrado.");
      }

      const service = await ctx.db.query.services.findFirst({
        where: (table) =>
          eq(table.id, serviceId) &&
          eq(table.establishmentId, ctx.establishmentId),
      });

      if (!service) {
        throw new Error("Serviço não encontrado.");
      }

      const existingEmployeeService =
        await ctx.db.query.employeeServices.findFirst({
          where: (table) =>
            and(
              eq(table.employeeId, employeeId),
              eq(table.serviceId, serviceId),
            ),
        });

      console.log(existingEmployeeService);

      if (existingEmployeeService) {
        throw new Error("Este serviço já está associado ao funcionário.");
      }

      const [newEmployeeService] = await ctx.db
        .insert(employeeServices)
        .values({
          employeeId,
          serviceId,
          commission: commission || "0.00",
        })
        .returning();

      if (!newEmployeeService) {
        throw new Error("Falha ao associar o serviço ao funcionário.");
      }

      return newEmployeeService;
    }),

  updateEmployeeUnavailabilities: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        unavailabilitiesItens: z.array(
          z.object({
            id: z.string().optional(),
            dayOfWeek: z.number(),
            startTime: z.string(),
            endTime: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { employeeId, unavailabilitiesItens } = input;

      const employee = await ctx.db.query.employees.findFirst({
        where: (table) =>
          and(
            eq(table.id, employeeId),
            eq(table.establishmentId, ctx.establishmentId),
          ),
      });

      if (!employee) {
        throw new Error("Funcionário não encontrado.");
      }

      await ctx.db
        .delete(unavailabilities)
        .where(eq(unavailabilities.employeeId, employeeId));

      if (unavailabilitiesItens.length < 1) {
        return {
          success: true,
          message: "Indisponibilidades atualizadas com sucesso.",
        };
      }

      const newUnavailabilities = unavailabilitiesItens.map(
        (unavailability) => ({
          employeeId,
          dayOfWeek: unavailability.dayOfWeek,
          startTime: unavailability.startTime,
          endTime: unavailability.endTime,
        }),
      );

      await ctx.db.insert(unavailabilities).values(newUnavailabilities);

      return {
        success: true,
        message: "Indisponibilidades atualizadas com sucesso.",
      };
    }),

  deleteEmployeeService: protectedProcedure
    .input(z.object({ employeeId: z.string(), serviceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { employeeId, serviceId } = input;

      await ctx.db
        .delete(employeeServices)
        .where(
          eq(employeeServices.employeeId, employeeId) &&
            eq(employeeServices.serviceId, serviceId),
        );

      return {
        success: true,
        message: "Service desvilculado do funcionário.",
      };
    }),

  updateEmployee: protectedProcedure
    .input(
      updateEmployeeSchema.extend({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const employee = await ctx.db.query.employees.findFirst({
        where: (table) =>
          and(
            eq(table.id, input.id),
            eq(table.establishmentId, ctx.establishmentId),
          ),
      });

      if (!employee) {
        throw new Error("Funcionário não encontrado.");
      }

      const [updatedEmployee] = await ctx.db
        .update(employees)
        .set({
          active: input.active,
          address: input.address,
          email: input.email,
          name: input.name,
          phone: clearNumber(input.phone ?? ""),
        })
        .where(
          and(
            eq(employees.id, input.id),
            eq(employees.establishmentId, ctx.establishmentId),
          ),
        )
        .returning();

      return updatedEmployee;
    }),

  updateEmployeeCommission: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        serviceId: z.string(),
        commission: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Verifica se o funcionário pertence ao estabelecimento
      const employee = await ctx.db.query.employees.findFirst({
        where: (table) =>
          and(
            eq(table.id, input.employeeId),
            eq(table.establishmentId, ctx.establishmentId),
          ),
      });

      if (!employee) {
        throw new Error("Funcionário não encontrado.");
      }

      // Verifica se o serviço pertence ao estabelecimento
      const service = await ctx.db.query.services.findFirst({
        where: (table) =>
          and(
            eq(table.id, input.serviceId),
            eq(table.establishmentId, ctx.establishmentId),
          ),
      });

      if (!service) {
        throw new Error("Serviço não encontrado.");
      }

      // Atualiza a comissão na tabela de relacionamento
      const [updatedCommission] = await ctx.db
        .update(employeeServices)
        .set({ commission: input.commission })
        .where(
          and(
            eq(employeeServices.employeeId, input.employeeId),
            eq(employeeServices.serviceId, input.serviceId),
          ),
        )
        .returning();

      if (!updatedCommission) {
        throw new Error("Falha ao atualizar a comissão.");
      }

      return updatedCommission;
    }),
};
