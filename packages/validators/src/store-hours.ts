import { z } from "zod";

export const storeHourSchema = z.object({
  openTime: z
    .string()
    .regex(
      /^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/,
      "Invalid time format",
    ),
  closeTime: z
    .string()
    .regex(
      /^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/,
      "Invalid time format",
    ),
  breakStart: z
    .string()
    .regex(
      /^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/,
      "Invalid time format",
    )
    .optional(),
  breakEnd: z
    .string()
    .regex(
      /^([01]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/,
      "Invalid time format",
    )
    .optional(),
  dayOfWeek: z.string(),
  active: z.boolean(),
});

export const storeHoursSchema = z.array(storeHourSchema);
