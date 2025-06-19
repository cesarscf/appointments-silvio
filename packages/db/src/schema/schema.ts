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

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "completed",
  "canceled",
]);

export const paymentTypeEnum = pgEnum("payment_type", [
  "pix",
  "credit_card",
  "debit_card",
  "cash",
  "package",
  "loyalty",
  "other",
]);

export const establishments = pgTable("establishments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  theme: text("theme").notNull().default("blue"),
  about: text("about"),
  slug: text("slug").notNull(),
  logo: text("logo"),
  banner: text("banner"),
  phone: text("phone"),
  servicesPerformed: text("services_performed"),
  activeCustomers: text("active_customers"),
  experienceTime: text("experience_time"),
  googleMapsLink: text("google_maps_link"),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  active: boolean("active").default(true).notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const unavailabilities = pgTable("unavailabilities", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week"),
  startTime: time("start_time"),
  endTime: time("end_time"),
  date: timestamp("date"),
  reason: text("reason"),
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
  active: boolean("active").default(true).notNull(),
  image: text("image"),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  active: boolean("active").default(true).notNull(),
  commission: decimal("commission", { precision: 5, scale: 2 }).notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  birthDate: timestamp("birth_date", { mode: "date" }),
  phoneNumber: text("phone_number").notNull(),
  cpf: text("cpf"),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
  checkinAt: timestamp("checkin_at"),
  paymentType: paymentTypeEnum("payment_type"),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  paymentNote: text("payment_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tabelas para Pacotes de Serviços
export const servicePackages = pgTable("service_packages", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  commission: decimal("commission", { precision: 5, scale: 2 }).notNull(),
  packagePrice: decimal("package_price", { precision: 10, scale: 2 }).notNull(),
  active: boolean("active").default(true).notNull(),
  description: text("description"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customerPackages = pgTable("customer_packages", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  packageId: uuid("package_id")
    .notNull()
    .references(() => servicePackages.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  employeeId: uuid("employee_id").references(() => employees.id, {
    onDelete: "set null",
  }),
  remainingSessions: integer("remaining_sessions").notNull(),
  totalSessions: integer("total_sessions").notNull(),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
  paid: boolean("paid").notNull().default(false),
  expiresAt: timestamp("expires_at"),
});

export const packageAppointments = pgTable("package_appointments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  packageId: uuid("package_id")
    .notNull()
    .references(() => customerPackages.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  usedAt: timestamp("used_at").notNull().defaultNow(),
});

// Tabelas para Programa de Fidelidade
export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  pointsPerService: integer("points_per_service").notNull(),
  requiredPoints: integer("required_points").notNull(),
  bonusServiceId: uuid("bonus_service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  bonusQuantity: integer("bonus_quantity").notNull().default(1),
  active: boolean("active").default(true).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const customerLoyalty = pgTable("customer_loyalty", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  programId: uuid("program_id")
    .notNull()
    .references(() => loyaltyPrograms.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  accumulatedPoints: integer("accumulated_points").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const loyaltyBonuses = pgTable("loyalty_bonuses", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  loyaltyId: uuid("loyalty_id")
    .notNull()
    .references(() => customerLoyalty.id, { onDelete: "cascade" }),
  bonusServiceId: uuid("bonus_service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
  used: boolean("used").notNull().default(false),
  usedAt: timestamp("used_at"),
});

// Relações
export const customersRelations = relations(customers, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [customers.establishmentId],
    references: [establishments.id],
    relationName: "establishmentCustomers",
  }),
  appointments: many(appointments, { relationName: "customerAppointments" }),
  customerPackages: many(customerPackages, {
    relationName: "customerCustomerPackages",
  }),
  customerLoyalty: many(customerLoyalty, {
    relationName: "customerCustomerLoyalty",
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
  customerPackages: many(customerPackages, {
    relationName: "employeeCustomerPackages",
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
    customers: many(customers, { relationName: "establishmentCustomers" }),
    servicePackages: many(servicePackages, {
      relationName: "establishmentServicePackages",
    }),
    loyaltyPrograms: many(loyaltyPrograms, {
      relationName: "establishmentLoyaltyPrograms",
    }),
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
  servicePackages: many(servicePackages, {
    relationName: "serviceServicePackages",
  }),
  loyaltyProgramsAsService: many(loyaltyPrograms, {
    relationName: "serviceLoyaltyPrograms",
  }),
  loyaltyProgramsAsBonus: many(loyaltyPrograms, {
    relationName: "bonusServiceLoyaltyPrograms",
  }),
  loyaltyBonuses: many(loyaltyBonuses, {
    relationName: "bonusServiceLoyaltyBonuses",
  }),
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
  packageAppointment: one(packageAppointments, {
    fields: [appointments.id],
    references: [packageAppointments.appointmentId],
    relationName: "appointmentPackageAppointment",
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

export const servicePackagesRelations = relations(
  servicePackages,
  ({ one, many }) => ({
    establishment: one(establishments, {
      fields: [servicePackages.establishmentId],
      references: [establishments.id],
      relationName: "establishmentServicePackages",
    }),
    service: one(services, {
      fields: [servicePackages.serviceId],
      references: [services.id],
      relationName: "serviceServicePackages",
    }),
    customerPackages: many(customerPackages, {
      relationName: "servicePackageCustomerPackages",
    }),
  }),
);

export const customerPackagesRelations = relations(
  customerPackages,
  ({ one, many }) => ({
    package: one(servicePackages, {
      fields: [customerPackages.packageId],
      references: [servicePackages.id],
      relationName: "servicePackageCustomerPackages",
    }),
    customer: one(customers, {
      fields: [customerPackages.customerId],
      references: [customers.id],
      relationName: "customerCustomerPackages",
    }),
    employee: one(employees, {
      fields: [customerPackages.employeeId],
      references: [employees.id],
      relationName: "employeeCustomerPackages",
    }),
    packageAppointments: many(packageAppointments, {
      relationName: "customerPackagePackageAppointments",
    }),
  }),
);

export const packageAppointmentsRelations = relations(
  packageAppointments,
  ({ one }) => ({
    package: one(customerPackages, {
      fields: [packageAppointments.packageId],
      references: [customerPackages.id],
      relationName: "customerPackagePackageAppointments",
    }),
    appointment: one(appointments, {
      fields: [packageAppointments.appointmentId],
      references: [appointments.id],
      relationName: "appointmentPackageAppointment",
    }),
  }),
);

export const loyaltyProgramsRelations = relations(
  loyaltyPrograms,
  ({ one, many }) => ({
    establishment: one(establishments, {
      fields: [loyaltyPrograms.establishmentId],
      references: [establishments.id],
      relationName: "establishmentLoyaltyPrograms",
    }),
    service: one(services, {
      fields: [loyaltyPrograms.serviceId],
      references: [services.id],
      relationName: "serviceLoyaltyPrograms",
    }),
    bonusService: one(services, {
      fields: [loyaltyPrograms.bonusServiceId],
      references: [services.id],
      relationName: "bonusServiceLoyaltyPrograms",
    }),
    customerLoyalty: many(customerLoyalty, {
      relationName: "loyaltyProgramCustomerLoyalty",
    }),
  }),
);

export const customerLoyaltyRelations = relations(
  customerLoyalty,
  ({ one, many }) => ({
    program: one(loyaltyPrograms, {
      fields: [customerLoyalty.programId],
      references: [loyaltyPrograms.id],
      relationName: "loyaltyProgramCustomerLoyalty",
    }),
    customer: one(customers, {
      fields: [customerLoyalty.customerId],
      references: [customers.id],
      relationName: "customerCustomerLoyalty",
    }),
    bonuses: many(loyaltyBonuses, {
      relationName: "customerLoyaltyLoyaltyBonuses",
    }),
  }),
);

export const loyaltyBonusesRelations = relations(loyaltyBonuses, ({ one }) => ({
  loyalty: one(customerLoyalty, {
    fields: [loyaltyBonuses.loyaltyId],
    references: [customerLoyalty.id],
    relationName: "customerLoyaltyLoyaltyBonuses",
  }),
  bonusService: one(services, {
    fields: [loyaltyBonuses.bonusServiceId],
    references: [services.id],
    relationName: "bonusServiceLoyaltyBonuses",
  }),
}));

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

export type ServicePackage = typeof servicePackages.$inferSelect;
export type NewServicePackage = typeof servicePackages.$inferInsert;

export type CustomerPackage = typeof customerPackages.$inferSelect;
export type NewCustomerPackage = typeof customerPackages.$inferInsert;

export type PackageAppointment = typeof packageAppointments.$inferSelect;
export type NewPackageAppointment = typeof packageAppointments.$inferInsert;

export type LoyaltyProgram = typeof loyaltyPrograms.$inferSelect;
export type NewLoyaltyProgram = typeof loyaltyPrograms.$inferInsert;

export type CustomerLoyalty = typeof customerLoyalty.$inferSelect;
export type NewCustomerLoyalty = typeof customerLoyalty.$inferInsert;

export type LoyaltyBonus = typeof loyaltyBonuses.$inferSelect;
export type NewLoyaltyBonus = typeof loyaltyBonuses.$inferInsert;
