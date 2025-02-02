"use client";

import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { ClientCard } from "./client-card";
import { CreateClientButton } from "./create-client-button";

export default function Clients() {
  const [clients] = api.clientR.all.useSuspenseQuery();

  const apiUtils = api.useUtils();
  const deleteMutation = api.clientR.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente excluído");
      void apiUtils.clientR.all.invalidate();
    },
  });

  const clientsEmpty = clients.length < 1;
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex w-full items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Clientes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <CreateClientButton />
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 px-8 pb-8 sm:grid-cols-2 md:grid-cols-3">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onDelete={() => {
              deleteMutation.mutate({
                clientId: client.id,
              });
            }}
          />
        ))}

        {clientsEmpty ? "Nenhum cliente cadastrado" : null}
      </div>
    </>
  );
}
