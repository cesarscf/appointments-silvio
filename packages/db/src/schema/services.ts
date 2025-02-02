import { relations } from "drizzle-orm";
import { decimal, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { appointments, categories, employeeServices, stores } from ".";

export const services = pgTable("services", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  price: decimal("price").notNull(),
  description: text("description"),
  estimatedTime: integer("estimated_time").notNull(),
  image: text("image"),

  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
});

export const servicesRelations = relations(services, ({ one, many }) => ({
  store: one(stores, {
    fields: [services.storeId],
    references: [stores.id],
    relationName: "storeServices",
  }),
  category: one(categories, {
    fields: [services.storeId],
    references: [categories.id],
  }),
  appointments: many(appointments, { relationName: "serviceAppointments" }),
  employeeServices: many(employeeServices),
}));

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
