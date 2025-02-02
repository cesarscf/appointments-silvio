import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string(),
});

export const updateCategorySchema = z.object({
  name: z.string(),
});
