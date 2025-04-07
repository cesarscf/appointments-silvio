import { api, HydrateClient } from "@/trpc/server";
import { Customers } from "./_components/customers";

export default function Page() {
  void api.customer.listCustomers.prefetch();

  return (
    <HydrateClient>
      <Customers />
    </HydrateClient>
  );
}
