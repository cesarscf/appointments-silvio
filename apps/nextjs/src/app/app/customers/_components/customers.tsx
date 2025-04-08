"use client";

import React from "react";
import { toast } from "sonner";

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
import { CreateCustomerButton } from "./create-customer-button";
import { CustomerCard } from "./customer-card";

export function Customers() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const [customers] = api.customer.listCustomers.useSuspenseQuery();

  const apiUtils = api.useUtils();
  const deleteMutation = api.customer.deleteCustomer.useMutation({
    onSuccess: () => {
      toast.success("Cliente excluído.");
      void apiUtils.customer.listCustomers.invalidate();
    },
  });

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex w-full items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  Clientes {`(${customers.length})`}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <CreateCustomerButton />
        </div>
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

      <div className="mt-4 grid grid-cols-1 gap-6 px-8 pb-8 sm:grid-cols-2 md:grid-cols-3">
        {customers.map((client) => (
          <CustomerCard
            key={client.id}
            customer={client}
            onDelete={() => {
              deleteMutation.mutate({
                id: client.id,
              });
            }}
          />
        ))}

        {filteredCustomers.length === 0 && (
          <p className="text-muted-foreground">
            {customers.length === 0
              ? "Nenhum cliente cadastrado"
              : "Nenhum cliente encontrado"}
          </p>
        )}
      </div>
    </>
  );
}
