import { api, HydrateClient } from "@/trpc/server";
import { Employees } from "./_components/employees";

export default function Page() {
  void api.employee.all.prefetch();
  void api.service.all.prefetch();

  return (
    <HydrateClient>
      <Employees />
    </HydrateClient>
  );
}
