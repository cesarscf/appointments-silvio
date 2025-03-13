import { api, HydrateClient } from "@/trpc/server";
import { BookingPage } from "./_components/booking-page";

export type SearchParams = Record<string, string | string[] | undefined>;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { serviceId } = searchParams;

  void api.store.getBySlug.prefetch({
    slug,
  });

  void api.service.byId.prefetch(serviceId as string);

  return (
    <HydrateClient>
      <BookingPage />
    </HydrateClient>
  );
}
