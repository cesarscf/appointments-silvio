import { api, HydrateClient } from "@/trpc/server";
import { PackagesPage } from "./_components/packages-page";

export default function Page() {
  void api.service.listServices.prefetch();
  void api.package.getAll.prefetch();

  return (
    <HydrateClient>
      <PackagesPage />
    </HydrateClient>
  );
}
