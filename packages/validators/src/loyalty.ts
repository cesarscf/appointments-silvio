import { z } from "zod";

export const loyaltyProgramSchema = z.object({
  id: z.string().uuid().optional(),
  establishmentId: z.string().uuid(),
  name: z.string().min(3, "Nome muito curto"),
  serviceId: z.string().uuid(),
  pointsPerService: z.number().int().positive("Deve ser positivo"),
  requiredPoints: z.number().int().positive("Deve ser positivo"),
  bonusServiceId: z.string().uuid(),
  bonusQuantity: z.number().int().positive("Deve ser positivo").default(1),
  active: z.boolean().default(true),
});
