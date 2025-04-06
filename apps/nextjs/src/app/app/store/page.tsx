import { api, HydrateClient } from "@/trpc/server";
import { Store } from "./_components/store";

export default async function Page() {
  void api.establishment.getEstablishmentById.prefetch();
  void api.openingHours.listOpeningHoursByEstablishment.prefetch();

  return (
    <HydrateClient>
      <Store />
    </HydrateClient>
  );
}
