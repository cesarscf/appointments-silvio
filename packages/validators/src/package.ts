import { z } from "zod";

export const servicePackageSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  quantity: z
    .number({ invalid_type_error: "Quantidade deve ser um número" })
    .positive("Quantidade deve ser maior que zero")
    .min(1, "Quantidade mínima é 1"),
  servicePrice: z
    .string({ required_error: "Digite o valor do serviço" })
    .min(1, "Digite o valor do serviço")
    .refine(
      (val) => {
        const number = Number(val.replace(",", "."));
        return !isNaN(number) && number > 0;
      },
      { message: "Valor deve ser um número positivo" },
    ),
  commission: z
    .number({ invalid_type_error: "Comissão deve ser um número" })
    .min(0, "Comissão não pode ser negativa")
    .max(100, "Comissão não pode exceder 100%"),
  packagePrice: z
    .number({ invalid_type_error: "Preço deve ser um número" })
    .min(0, "Preço não pode ser negativo"),
  active: z.boolean().default(true),
  description: z.string().optional(),
});
