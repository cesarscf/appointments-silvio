import { api, HydrateClient } from "@/trpc/server";
import { CustomerAppointments } from "./_components/cutomer-appointments";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void api.customer.listCustomerAppointments.prefetch({
    id,
  });
  void api.customer.getCustomerById.prefetch({
    id,
  });

  return (
    <HydrateClient>
      <CustomerAppointments />
    </HydrateClient>
  );
}
