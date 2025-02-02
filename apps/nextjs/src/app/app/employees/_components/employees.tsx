"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { CreateEmployeeButton } from "./create-employee-button";
import { EmployeeCard } from "./employee-card";

export function Employees() {
  const [employees] = api.employee.all.useSuspenseQuery();

  const employeesEmpty = employees.length < 1;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Funcionários</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <CreateEmployeeButton />
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 px-8 pb-8 sm:grid-cols-2 md:grid-cols-3">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
        {employeesEmpty ? "Nenhum funcionário cadastrado" : null}
      </div>
    </>
  );
}
