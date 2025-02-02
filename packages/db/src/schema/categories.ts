import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { services, stores } from ".";

export const categories = pgTable("categories", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),

  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
});

export const categoryRelations = relations(categories, ({ one, many }) => ({
  store: one(stores, {
    fields: [categories.storeId],
    references: [stores.id],
  }),
  services: many(services, { relationName: "categoryServices" }),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
