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
import { CreateServicePackageButton } from "./create-packages-button";
import ServicePackageCard from "./package-card";

export function PackagesPage() {
  const [services] = api.service.listServices.useSuspenseQuery();
  const [packages] = api.package.getAll.useSuspenseQuery();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Pacotes de serviço</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <CreateServicePackageButton services={services} />
      </header>
      <div className="w-full space-y-6 px-6">
        <h2 className="text-2xl font-bold">Pacotes de Serviços</h2>
        <ServicePackageCard servicePackages={packages} />
      </div>
    </>
  );
}
