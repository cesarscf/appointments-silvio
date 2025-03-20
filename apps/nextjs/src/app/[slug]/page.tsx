import { api, HydrateClient } from "@/trpc/server";
import { StorePage } from "./_components/store-page";

import "@/styles/store-theme.css";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  void api.establishment.getEstablishmentBySlug.prefetch({
    slug,
  });

  return (
    <HydrateClient>
      <StorePage />
    </HydrateClient>
  );
}
