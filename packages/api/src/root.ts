import { appointmentRouter } from "./router/appointment";
import { authRouter } from "./router/auth";
import { categoryRouter } from "./router/category";
import { employeeRouter } from "./router/employee";
import { establishmentRouter } from "./router/establishment";
import { openingHoursRouter } from "./router/opening-hours";
import { serviceRouter } from "./router/service";
import { serviceCategoryRouter } from "./router/service-category";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  service: serviceRouter,
  category: categoryRouter,
  employee: employeeRouter,
  openingHoursList: openingHoursRouter,
  establishment: establishmentRouter,
  appointment: appointmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
