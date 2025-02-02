import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { appointments, employeeServices, stores } from ".";

export const employees = pgTable("employees", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  photo: text("photo"),
  workingDays: text("working_days"),

  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
});

export const employeesRelations = relations(employees, ({ one, many }) => ({
  store: one(stores, {
    fields: [employees.storeId],
    references: [stores.id],
    relationName: "storeEmployees",
  }),
  appointments: many(appointments, { relationName: "employeeAppointments" }),
  employeeServices: many(employeeServices),
}));

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
