import { api, HydrateClient } from "@/trpc/server";
import { Services } from "./_components/services";

export default function Page() {
  void api.service.listServices.prefetch();
  void api.category.listCategories.prefetch();

  return (
    <HydrateClient>
      <Services />
    </HydrateClient>
  );
}
