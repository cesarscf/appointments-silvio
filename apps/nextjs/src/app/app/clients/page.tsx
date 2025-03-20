import { api, HydrateClient } from "@/trpc/server";
import Clients from "./_components/clients";

export default function Page() {
  void api.customer.listCustomers.prefetch();

  return (
    <HydrateClient>
      <Clients />
    </HydrateClient>
  );
}
