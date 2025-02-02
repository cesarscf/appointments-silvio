import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z.string(),
  role: z.string(),
  photo: z.string().optional(),
  workingDays: z.string().optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  photo: z.string().optional(),
  workingDays: z.string().optional(),
});

export const createEmployeeServiceSchema = z.object({
  commission: z.string(),
  employeeId: z.string(),
  serviceId: z.string(),
});
