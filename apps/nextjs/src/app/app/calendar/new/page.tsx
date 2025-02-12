import { api, HydrateClient } from "@/trpc/server";
import { NewAppoitment } from "./new-appointment";

export default async function Page() {
  void api.service.all.prefetch();
  void api.clientR.all.prefetch();
  void api.employee.all.prefetch();

  return (
    <HydrateClient>
      <NewAppoitment />
    </HydrateClient>
  );
}
