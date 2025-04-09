import { eq } from "drizzle-orm";
import { z } from "zod";

import { serviceCategories, services } from "@acme/db/schema";
import { createServiceSchema, updateServiceSchema } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const serviceRouter = {
  listServices: protectedProcedure.query(async ({ ctx }) => {
    const servicesList = await ctx.db.query.services.findMany({
      where: eq(services.establishmentId, ctx.establishmentId),
      with: {
        categories: {
          with: {
            category: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const formattedServicesList = servicesList.map((service) => ({
      id: service.id,
      name: service.name,
      establishmentId: service.establishmentId,
      duration: service.duration,
      active: service.active,
      price: service.price,
      image: service.image,
      categories: service.categories.map((sc) => {
        return {
          id: sc.category.id,
          name: sc.category.name,
        };
      }),
    }));

    return formattedServicesList;
  }),
  deleteService: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const service = await ctx.db
        .select()
        .from(services)
        .where(eq(services.id, id))
        .limit(1);

      if (!service[0]) {
        throw new Error("Serviço não encontrado");
      }

      await ctx.db.delete(services).where(eq(services.id, id));

      return { success: true, message: "Serviço excluído com sucesso" };
    }),

  updateService: protectedProcedure
    .input(
      updateServiceSchema.extend({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, duration, price, categoryIds, active, image } = input;

      const service = await ctx.db.query.services.findFirst({
        where: eq(services.id, id),
      });

      if (!service) {
        throw new Error("Serviço não encontrado");
      }

      const [updatedService] = await ctx.db
        .update(services)
        .set({
          name,
          duration,
          price: price.replace(",", "."),
          active: input.active,
          image,
        })
        .where(eq(services.id, id))
        .returning();

      if (categoryIds) {
        await ctx.db
          .delete(serviceCategories)
          .where(eq(serviceCategories.serviceId, id));

        await ctx.db.insert(serviceCategories).values(
          categoryIds.map((categoryId) => ({
            serviceId: id,
            categoryId,
          })),
        );
      }

      return updatedService;
    }),

  createService: protectedProcedure
    .input(createServiceSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, duration, price, categoryIds, image } = input;
      console.log(price);
      const [newService] = await ctx.db
        .insert(services)
        .values({
          name,
          duration,
          price: price.replace(",", "."),
          establishmentId: ctx.establishmentId,
          image,
        })
        .returning();

      if (!newService) {
        throw new Error("Erro ao criar o serviço");
      }

      if (categoryIds && categoryIds.length > 0) {
        await ctx.db.insert(serviceCategories).values(
          categoryIds.map((categoryId) => ({
            serviceId: newService.id,
            categoryId,
          })),
        );
      }

      return newService;
    }),

  getServiceById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const service = await ctx.db.query.services.findFirst({
        where: (table, { eq }) => eq(table.id, id),
      });

      if (!service) {
        throw new Error("Serviço não encontrado.");
      }

      return service;
    }),

  getEmployeesByService: publicProcedure
    .input(
      z.object({
        serviceId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { serviceId } = input;

      const employees = await ctx.db.query.employeeServices.findMany({
        where: (employeeServices, { eq }) =>
          eq(employeeServices.serviceId, serviceId),
        with: {
          employee: true,
          service: true,
        },
      });

      return employees.map((es) => ({
        ...es.employee,
      }));
    }),

  getServicesByEmployee: publicProcedure
    .input(
      z.object({
        employeeId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { employeeId } = input;

      const services = await ctx.db.query.employeeServices.findMany({
        where: (employeeServices, { eq }) =>
          eq(employeeServices.employeeId, employeeId),
        with: {
          employee: true,
          service: true,
        },
      });

      return services.map((es) => ({
        ...es.service,
      }));
    }),
};
