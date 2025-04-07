import { generateId } from "better-auth";

import { db } from "@acme/db/client";
import { establishments, openingHours } from "@acme/db/schema";
import { slugify } from "@acme/utils";

export async function createDefaultOrganization(user: {
  id: string;
  name: string;
}) {
  // Create default organization for new user
  const [establishment] = await db
    .insert(establishments)
    .values({
      name: user.name,
      slug: `${slugify(user.name)}-${generateId().slice(0, 8)}`,
      userId: user.id,
      about:
        "Atendemos com qualidade, cuidado e dedicação. Aqui, você encontra um serviço feito para você, com horários flexíveis e uma equipe pronta para te receber. Agende sua visita!",
    })
    .returning();

  if (!establishment) {
    throw new Error("Failed to create store");
  }

  const defaultOpeningHours = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    establishmentId: establishment.id,
    dayOfWeek: day,
    openingTime: "08:00:00",
    closingTime: "18:00:00",
  }));

  await db.insert(openingHours).values(defaultOpeningHours);

  return establishment;
}
