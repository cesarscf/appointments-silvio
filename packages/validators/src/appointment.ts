import { z } from "zod";

export const createAppointmentSchema = z.object({
  date: z.coerce.date(),
  status: z.string(),
  checkIn: z.boolean(),
  serviceId: z.string().uuid(),
  employeeId: z.string().uuid(),
  clientId: z.string().uuid(),
});
