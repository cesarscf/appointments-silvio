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
  const { serviceId: id, servicePackageId } = searchParams as {
    serviceId: string;
    servicePackageId: string | null;
  };

  void api.establishment.getEstablishmentBySlug.prefetch({
    slug,
  });

  void api.service.getServiceById.prefetch({ id });
  void api.service.getEmployeesByService.prefetch({ serviceId: id });
  if (servicePackageId) {
    void api.package.getById.prefetch({ id: servicePackageId });
  }

  return (
    <HydrateClient>
      <BookingServicePage />
    </HydrateClient>
  );
}
