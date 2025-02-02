import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { stores } from ".";

export const addresses = pgTable("addresses", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),

  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  store: one(stores, {
    fields: [addresses.storeId],
    references: [stores.id],
    relationName: "storeAddresses",
  }),
}));

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
