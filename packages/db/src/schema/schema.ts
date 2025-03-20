import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth-schema";

// Tabelas
export const establishments = pgTable("establishments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

export const openingHours = pgTable("opening_hours", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  openingTime: time("opening_time").notNull(),
  closingTime: time("closing_time").notNull(),
});

export const intervals = pgTable("intervals", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  openingHourId: uuid("opening_hour_id")
    .notNull()
    .references(() => openingHours.id, { onDelete: "cascade" }),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

export const employees = pgTable("employees", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const unavailabilities = pgTable("unavailabilities", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week"),
  startTime: time("start_time"),
  endTime: time("end_time"),
});

export const categories = pgTable("categories", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
});

export const services = pgTable("services", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  duration: integer("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
});

export const serviceCategories = pgTable("service_categories", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
});

export const employeeServices = pgTable("employee_services", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  commission: decimal("commission", { precision: 5, scale: 2 }).notNull(),
});

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "completed",
]);

export const appointments = pgTable("appointments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  checkin: boolean("checkin").notNull().default(false),
});

export const customers = pgTable("customers", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cpf: text("cpf").notNull().unique(),
  birthDate: timestamp("birth_date", { mode: "date" }).notNull(),
  phoneNumber: text("phone_number"),
  email: text("email"),
  address: text("address"),
});

// Relações
export const customersRelations = relations(customers, ({ one }) => ({
  establishment: one(establishments, {
    fields: [customers.establishmentId],
    references: [establishments.id],
    relationName: "establishmentCustomers",
  }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [employees.establishmentId],
    references: [establishments.id],
    relationName: "establishmentEmployees",
  }),
  employeeServices: many(employeeServices, {
    relationName: "employeeEmployeeServices",
  }),
  unavailabilities: many(unavailabilities, {
    relationName: "employeeUnavailabilities",
  }),
  appointments: many(appointments, {
    relationName: "employeeAppointments",
  }),
}));

export const employeeServicesRelations = relations(
  employeeServices,
  ({ one }) => ({
    employee: one(employees, {
      fields: [employeeServices.employeeId],
      references: [employees.id],
      relationName: "employeeEmployeeServices",
    }),
    service: one(services, {
      fields: [employeeServices.serviceId],
      references: [services.id],
      relationName: "serviceEmployeeServices",
    }),
  }),
);

export const establishmentsRelations = relations(
  establishments,
  ({ many }) => ({
    employees: many(employees, { relationName: "establishmentEmployees" }),
    openingHours: many(openingHours, {
      relationName: "establishmentOpeningHours",
    }),
    categories: many(categories, { relationName: "establishmentCategories" }),
    services: many(services, { relationName: "establishmentServices" }),
  }),
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [categories.establishmentId],
    references: [establishments.id],
    relationName: "establishmentCategories",
  }),
  services: many(serviceCategories, { relationName: "categoryServices" }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [services.establishmentId],
    references: [establishments.id],
    relationName: "establishmentServices",
  }),
  employeeServices: many(employeeServices, {
    relationName: "serviceEmployeeServices",
  }),
  categories: many(serviceCategories, { relationName: "serviceCategories" }),
}));

export const serviceCategoriesRelations = relations(
  serviceCategories,
  ({ one }) => ({
    service: one(services, {
      fields: [serviceCategories.serviceId],
      references: [services.id],
      relationName: "serviceCategories",
    }),
    category: one(categories, {
      fields: [serviceCategories.categoryId],
      references: [categories.id],
      relationName: "categoryServices",
    }),
  }),
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  employee: one(employees, {
    fields: [appointments.employeeId],
    references: [employees.id],
    relationName: "employeeAppointments",
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
    relationName: "serviceAppointments",
  }),
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
    relationName: "customerAppointments",
  }),
}));

export const openingHoursRelations = relations(
  openingHours,
  ({ one, many }) => ({
    establishment: one(establishments, {
      fields: [openingHours.establishmentId],
      references: [establishments.id],
      relationName: "establishmentOpeningHours",
    }),
    intervals: many(intervals, { relationName: "openingHourIntervals" }),
  }),
);

export const intervalsRelations = relations(intervals, ({ one }) => ({
  openingHour: one(openingHours, {
    fields: [intervals.openingHourId],
    references: [openingHours.id],
    relationName: "openingHourIntervals",
  }),
}));

export const unavailabilitiesRelations = relations(
  unavailabilities,
  ({ one }) => ({
    employee: one(employees, {
      fields: [unavailabilities.employeeId],
      references: [employees.id],
      relationName: "employeeUnavailabilities",
    }),
  }),
);

// Tipos
export type Establishment = typeof establishments.$inferSelect;
export type NewEstablishment = typeof establishments.$inferInsert;

export type OpeningHour = typeof openingHours.$inferSelect;
export type NewOpeningHour = typeof openingHours.$inferInsert;

export type Interval = typeof intervals.$inferSelect;
export type NewInterval = typeof intervals.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export type Unavailability = typeof unavailabilities.$inferSelect;
export type NewUnavailability = typeof unavailabilities.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;

export type EmployeeService = typeof employeeServices.$inferSelect;
export type NewEmployeeService = typeof employeeServices.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
