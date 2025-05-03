import { api, HydrateClient } from "@/trpc/server";
import { LoyaltiesPage } from "./_components/loyalties-page";

export default function Page() {
  void api.loyalty.getAll.prefetch();
  void api.service.listServices.prefetch();

  return (
    <HydrateClient>
      <LoyaltiesPage />
    </HydrateClient>
  );
}
