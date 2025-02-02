import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { clients, employees, services, stores } from ".";

export const appointments = pgTable("appointments", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(),
  checkIn: boolean("check_in").notNull(),

  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  store: one(stores, {
    fields: [appointments.storeId],
    references: [stores.id],
    relationName: "storeAppointments",
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  employee: one(employees, {
    fields: [appointments.employeeId],
    references: [employees.id],
  }),
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
}));

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
