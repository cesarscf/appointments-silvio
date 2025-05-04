import { api, HydrateClient } from "@/trpc/server";
import { LoyaltyCustomers } from "./_components/loyalty-customers";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void api.loyalty.listCustomersInProgram.prefetch({ programId: id });

  return (
    <HydrateClient>
      <LoyaltyCustomers />
    </HydrateClient>
  );
}
