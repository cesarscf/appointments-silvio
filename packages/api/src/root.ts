import { authRouter } from "./router/auth";
import { categoryRoute } from "./router/category";
import { clientRoute } from "./router/client";
import { employeeRoute } from "./router/employee";
import { serviceRoute } from "./router/service";
import { storeRoute } from "./router/store";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  store: storeRoute,
  service: serviceRoute,
  category: categoryRoute,
  employee: employeeRoute,
  clientR: clientRoute,
});

// export type definition of API
export type AppRouter = typeof appRouter;
