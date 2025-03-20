import { api, HydrateClient } from "@/trpc/server";
import { Employees } from "./_components/employees";

export default function Page() {
  void api.employee.listEmployees.prefetch();
  void api.service.listServices.prefetch();

  return (
    <HydrateClient>
      <Employees />
    </HydrateClient>
  );
}
