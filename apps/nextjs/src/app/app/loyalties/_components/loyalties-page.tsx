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
import { LoyaltyCard } from "./loyalty-card";
import { LoyaltyProgramModal } from "./loyalty-program-modal";

export function LoyaltiesPage() {
  const [loyalties] = api.loyalty.getAll.useSuspenseQuery();
  const [services] = api.service.listServices.useSuspenseQuery();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Fidelidades</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <LoyaltyProgramModal services={services} />
      </header>

      <div className="space-y-6 px-6">
        <h2 className="text-2xl font-bold">Planos de Fidelidade</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loyalties.map((loyalty) => (
            <LoyaltyCard
              key={loyalty.id}
              loyalty={loyalty}
              services={services}
            />
          ))}

          {loyalties.length < 1 && (
            <div className="text-sm text-muted-foreground">
              Nenhum plano foi criado ainda...
            </div>
          )}
        </div>
      </div>
    </>
  );
}
