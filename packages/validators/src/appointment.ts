import { z } from "zod";

export const createAppointmentSchema = z.object({
  date: z.coerce.date(),
  status: z.string(),
  checkIn: z.boolean(),
  serviceId: z.string().uuid(),
  employeeId: z.string().uuid(),
  clientId: z.string().uuid(),
});

export const publicCreateAppointmentSchema = z.object({
  serviceId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  employeeId: z.string().uuid(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  customer: z.object({
    name: z.string(),
    cpf: z.string(),
    birthDate: z.coerce.date(),
    phoneNumber: z.string(),
    email: z.string().optional(),
    address: z.string().optional(),
  }),
});
