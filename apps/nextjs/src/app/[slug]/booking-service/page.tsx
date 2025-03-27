import { api, HydrateClient } from "@/trpc/server";
import { BookingServicePage } from "./_components/booking-service-page";

export type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { serviceId: id } = searchParams as { serviceId: string };

  void api.establishment.getEstablishmentBySlug.prefetch({
    slug,
  });

  void api.service.getServiceById.prefetch({ id });
  void api.service.getEmployeesByService.prefetch({ serviceId: id });

  return (
    <HydrateClient>
      <BookingServicePage />
    </HydrateClient>
  );
}
