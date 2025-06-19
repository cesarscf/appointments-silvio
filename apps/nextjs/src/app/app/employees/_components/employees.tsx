"use client";

import { useState } from "react"; // Importação adicionada

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { CreateEmployeeButton } from "./create-employee-button";
import { EmployeeCard } from "./employee-card";

export function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees] = api.employee.listEmployees.useSuspenseQuery();
  const [services] = api.service.listServices.useSuspenseQuery();

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Profissionais</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <CreateEmployeeButton services={services} />
      </header>

      <div className="mt-4 px-8">
        <Input
          type="text"
          placeholder="Filtrar por nome"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[300px]"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 px-8 pb-8 sm:grid-cols-2 md:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}

        {filteredEmployees.length === 0 && (
          <p className="text-muted-foreground">
            {employees.length === 0
              ? "Nenhum funcionário cadastrado"
              : "Nenhum funcionário encontrado"}
          </p>
        )}
      </div>
    </>
  );
}
