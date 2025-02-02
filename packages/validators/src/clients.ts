import { z } from "zod";

export const createClientSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." })
    .max(256, { message: "O nome não pode exceder 256 caracteres." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Por favor, insira um número de telefone válido.",
  }),
  birthday: z.coerce.date({
    required_error: "É necessária uma data de nascimento.",
  }),

  email: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().optional(),
});

export const updateClientSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." })
    .max(256, { message: "O nome não pode exceder 256 caracteres." })
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, {
      message: "Por favor, insira um número de telefone válido.",
    })
    .optional(),
  birthday: z.coerce
    .date({
      required_error: "É necessária uma data de nascimento.",
    })
    .optional(),
  email: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().optional(),
});
