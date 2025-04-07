import { z } from "zod";

export const updateOpeningHoursSchema = z.array(
  z.object({
    dayOfWeek: z.number().min(0).max(6),
    openingTime: z.string(),
    closingTime: z.string(),
    intervals: z.array(
      z.object({
        startTime: z.string(),
        endTime: z.string(),
      }),
    ),
  }),
);

export type UpdateOpeningHours = z.infer<typeof updateOpeningHoursSchema>;
