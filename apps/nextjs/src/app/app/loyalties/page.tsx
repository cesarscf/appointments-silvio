import { HydrateClient } from "@/trpc/server";
import { LoyaltiesPage } from "./_components/loyalties-page";

export default function Page() {
  return (
    <HydrateClient>
      <LoyaltiesPage />
    </HydrateClient>
  );
}
