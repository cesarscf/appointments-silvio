import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { appointments } from "./appointments";
import { stores } from "./stores";

export const clients = pgTable("clients", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  birthDate: timestamp("birth_date", { withTimezone: true }).notNull(),
  cpf: text("cpf"),
  email: text("email"),
  address: text("address"),

  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
});

export const clientsRelations = relations(clients, ({ one, many }) => ({
  store: one(stores, {
    fields: [clients.storeId],
    references: [stores.id],
    relationName: "storeClients",
  }),
  appointments: many(appointments, { relationName: "clientAppointments" }),
}));

export type Client = typeof clients.$inferSelect;
export type NewClientt = typeof clients.$inferInsert;
