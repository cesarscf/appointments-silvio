import { api, HydrateClient } from "@/trpc/server";
import { Store } from "./_components/store";

export default function Page() {
  void api.store.getByUserId.prefetch();

  return (
    <HydrateClient>
      <Store />
    </HydrateClient>
  );
}
