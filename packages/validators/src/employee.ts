import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),

  phone: z.string(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),

  address: z
    .string()
    .trim()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(255, { message: "Address must be less than 255 characters" }),
  image: z.string().optional(),
  serviceIds: z.array(
    z.string().uuid({ message: "Invalid service ID format" }),
  ),
});

export const updateEmployeeSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  active: z.boolean().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  image: z.string().optional(),
});

export type CreateEmployee = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;
