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

      {loyalties.length < 1 && <div>Empty</div>}

      <div>
        {loyalties.map((it) => (
          <div key={it.id} className="grid grid-cols-2">
            <h2>{it.name}</h2>
          </div>
        ))}
      </div>
    </>
  );
}
