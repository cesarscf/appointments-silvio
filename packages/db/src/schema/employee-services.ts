import { relations } from "drizzle-orm";
import { decimal, pgTable, uuid } from "drizzle-orm/pg-core";

import { employees, services } from ".";

export const employeeServices = pgTable("employee_services", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  commission: decimal("commission").notNull(),

  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id),
});

export const employeeServicesRelations = relations(
  employeeServices,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeServices.employeeId],
      references: [employees.id],
    }),
    service: one(services, {
      fields: [employeeServices.serviceId],
      references: [services.id],
    }),
  }),
);

export type EmployeeService = typeof employeeServices.$inferSelect;
export type NewEmployeeService = typeof employeeServices.$inferInsert;
