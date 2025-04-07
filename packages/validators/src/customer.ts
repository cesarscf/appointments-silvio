import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." })
    .max(256, { message: "O nome não pode exceder 256 caracteres." }),
  phoneNumber: z.string().min(15, {
    message: "Por favor, insira um número de telefone válido.",
  }),
  birthDate: z.coerce.date({
    required_error: "É necessária uma data de nascimento.",
  }),

  email: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." })
    .max(256, { message: "O nome não pode exceder 256 caracteres." })
    .optional(),
  phoneNumber: z
    .string()
    .min(15, {
      message: "Por favor, insira um número de telefone válido.",
    })
    .optional(),
  birthDate: z.coerce
    .date({
      required_error: "É necessária uma data de nascimento.",
    })
    .optional(),
  email: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().optional(),
});

export type CreateCustomer = z.infer<typeof createCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;
