import { api, HydrateClient } from "@/trpc/server";
import { Services } from "./_components/services";

export default function Page() {
  void api.service.all.prefetch();
  void api.category.all.prefetch();

  return (
    <HydrateClient>
      <Services />
    </HydrateClient>
  );
}
