import { relations } from "drizzle-orm";
import { boolean, pgTable, text, time, uuid } from "drizzle-orm/pg-core";

import { stores } from ".";

export const storeHours = pgTable("store_hours", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  openTime: time("open_time").notNull().default("07:00"),
  closeTime: time("close_time").notNull().default("17:30"),
  breakStart: time("break_start").default("12:00"),
  breakEnd: time("break_end").default("13:00"),
  dayOfWeek: text("day_of_week").notNull(),
  active: boolean("active").notNull().default(true),

  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id),
});

export const storeHourRelations = relations(storeHours, ({ one, many }) => ({
  store: one(stores, {
    fields: [storeHours.storeId],
    references: [stores.id],
    relationName: "storeHours",
  }),
}));

export type StoreHour = typeof storeHours.$inferSelect;
export type NewStoreHour = typeof storeHours.$inferInsert;
