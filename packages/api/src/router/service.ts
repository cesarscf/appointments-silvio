import { services } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const serviceRouter = {
  listServices: protectedProcedure.query(async ({ ctx }) => {
    const servicesList = await ctx.db.select().from(services);

    return servicesList;
  }),
};
