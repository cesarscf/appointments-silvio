import { api, HydrateClient } from "@/trpc/server";
import { BookingEmployeePage } from "./_components/booking-employee-page";

export type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { employeeId } = searchParams as { employeeId: string };

  void api.establishment.getEstablishmentBySlug.prefetch({
    slug,
  });

  void api.service.getServicesByEmployee.prefetch({ employeeId });

  return (
    <HydrateClient>
      <BookingEmployeePage />
    </HydrateClient>
  );
}
