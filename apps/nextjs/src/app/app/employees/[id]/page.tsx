import { api, HydrateClient } from "@/trpc/server";
import { EmployeeDetails } from "./_components/employee-details";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void api.employee.getEmployeeById.prefetch({
    id,
  });
  void api.service.listServices.prefetch();

  return (
    <HydrateClient>
      <EmployeeDetails />
    </HydrateClient>
  );
}
