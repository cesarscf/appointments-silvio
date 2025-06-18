import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string(),
  duration: z.string().regex(/^\d+$/, {
    message: "A entrada deve conter apenas números",
  }),
  price: z.string(),
  image: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const updateServiceSchema = z.object({
  name: z.string(),
  duration: z.string().regex(/^\d+$/, {
    message: "A entrada deve conter apenas números",
  }),
  active: z.boolean(),
  price: z.string(),
  image: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export type CreateService = z.infer<typeof createServiceSchema>;
export type UpdateService = z.infer<typeof updateServiceSchema>;
