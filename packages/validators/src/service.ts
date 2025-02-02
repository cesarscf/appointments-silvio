import { z } from "zod";

export const createServiceSchema = z.object({
  categoryId: z.string().min(1, "Escolha uma categoria"),
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(50, "O nome pode ter no máximo 50 caracteres."),
  price: z
    .string({ message: "Digite o valor do serviço" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Deve ser um preço válido",
    }),
  estimatedTime: z.number(),
  description: z
    .string()
    .max(200, "A descrição pode ter no máximo 200 caracteres.")
    .optional(),
});

export const updateServiceSchema = z.object({
  categoryId: z.string().min(1, "Escolha uma categoria"),
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(50, "O nome pode ter no máximo 50 caracteres.")
    .optional(),
  price: z
    .string({ message: "Digite o valor do serviço" })
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: "Deve ser um preço válido",
    })
    .optional(),
  estimatedTime: z.number().optional(),
  description: z
    .string()
    .max(200, "A descrição pode ter no máximo 200 caracteres.")
    .optional(),
});
