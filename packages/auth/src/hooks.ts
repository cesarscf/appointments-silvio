import { generateId } from "better-auth";

import { db } from "@acme/db/client";
import { establishments, openingHours } from "@acme/db/schema";
import { slugify } from "@acme/utils";
import { resend } from ".";

export async function createDefaultOrganization(user: {
  id: string;
  name: string;
  email: string;
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

  resend.emails.send({
    from: "Agendar <onboarding@resend.dev>",
    to: [user.email],
    subject: "Bem-vindo ao Worqui!",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">Bem-vindo ao Worqui!</h1>
      </div>
      <div style="padding: 20px; color: #333;">
        <p>Olá, <strong>${user.name ?? "Usuário"}</strong>!</p>
        <p>Estamos muito felizes por ter você com a gente.</p>
        <p>Agora você pode encontrar profissionais qualificados para realizar os serviços que você precisa, de forma rápida e fácil.</p>
        <p style="margin-top: 20px;">
          <a href="https://agendar.tec.br/" style="display: inline-block; padding: 12px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">Acessar o app</a>
        </p>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">Se você tiver alguma dúvida, é só responder este e-mail ou acessar nossa central de ajuda.</p>
      </div>
    </div>
  `,
  });

  return establishment;
}
