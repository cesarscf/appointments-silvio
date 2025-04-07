import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string(),
  duration: z.number(),
  price: z.string(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const updateServiceSchema = z.object({
  name: z.string(),
  duration: z.number(),
  price: z.string(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export type CreateService = z.infer<typeof createServiceSchema>;
export type UpdateService = z.infer<typeof updateServiceSchema>;
