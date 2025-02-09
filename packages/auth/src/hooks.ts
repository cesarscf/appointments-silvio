import { generateId } from "better-auth";

import { db } from "@acme/db/client";
import { storeHours, stores } from "@acme/db/schema";

export async function createDefaultOrganization(user: {
  id: string;
  name: string;
}) {
  // Create default organization for new user
  const [org] = await db
    .insert(stores)
    .values({
      name: user.name,
      slug: `${slugify(user.name)}-${generateId().slice(0, 8)}`,
      userId: user.id,
    })
    .returning();

  if (!org) {
    throw new Error("Failed to create store");
  }

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  await db.insert(storeHours).values(
    daysOfWeek.map((item) => ({
      storeId: org.id,
      dayOfWeek: item,
    })),
  );

  return org;
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function unslugify(str: string) {
  return str.replace(/-/g, " ");
}
