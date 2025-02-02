import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import {
  addresses,
  appointments,
  clients,
  employees,
  services,
  users,
} from ".";

export const stores = pgTable("stores", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  logo: text("logo"),
  theme: text("theme").notNull().default("blue"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
});

export const storesRelations = relations(stores, ({ many }) => ({
  addresses: many(addresses, { relationName: "storeAddresses" }),
  appointments: many(appointments, { relationName: "storeAppointments" }),
  services: many(services, { relationName: "storeServices" }),
  clients: many(clients, { relationName: "storeClients" }),
  employees: many(employees, { relationName: "storeEmployees" }),
}));

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
