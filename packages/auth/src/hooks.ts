import { generateId } from "better-auth";

import { db } from "@acme/db/client";
import { stores } from "@acme/db/schema";

export async function createDefaultOrganization(user: {
  id: string;
  name: string;
}) {
  // Create default organization for new user
  const org = await db
    .insert(stores)
    .values({
      name: user.name,
      slug: `${slugify(user.name)}-${generateId().slice(0, 8)}`,
      userId: user.id,
    })
    .returning();

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
