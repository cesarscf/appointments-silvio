import { z } from "zod";

export const updateEstablishmentSchema = z.object({
  name: z.string().optional(),
  logo: z.string().optional(),
  theme: z.string().optional(),
  slug: z.string().optional(),
  about: z.string().optional(),
  banner: z.string().optional(),
});

export type UpdateEstablishment = z.infer<typeof updateEstablishmentSchema>;
