import { api, HydrateClient } from "@/trpc/server";
import { CustomerPackages } from "./_components/customer-packages";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void api.customer.getCustomerById.prefetch({
    id,
  });
  void api.customer.getCustomerPackages.prefetch({
    id,
  });

  return (
    <HydrateClient>
      <CustomerPackages />
    </HydrateClient>
  );
}
