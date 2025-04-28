import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string(),
  duration: z.number(),
  price: z.string(),
  image: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const updateServiceSchema = z.object({
  name: z.string(),
  duration: z.number(),
  active: z.boolean(),
  price: z.string(),
  image: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export type CreateService = z.infer<typeof createServiceSchema>;
export type UpdateService = z.infer<typeof updateServiceSchema>;
