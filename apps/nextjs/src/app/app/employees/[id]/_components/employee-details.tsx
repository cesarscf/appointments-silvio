"use client";

import { useParams } from "next/navigation";
import { Avatar } from "@radix-ui/react-avatar";
import { useQueryState } from "nuqs";

import { AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { EmployeeServiceManager } from "./employee-service-manager";
import { EmployeeUnavailabilityForm } from "./update-unavailabilities-form";

export function EmployeeDetails() {
  const { id } = useParams();
  console.log(id);
  const [employee] = api.employee.getEmployeeById.useSuspenseQuery({
    id: id as string,
  });
  const [services] = api.service.listServices.useSuspenseQuery();

  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "geral",
  });

  const tabs = [
    {
      id: "geral",
      title: "Geral",
    },
    {
      id: "services",
      title: "Serviços",
    },
    {
      id: "unavailabilities",
      title: "Indisponibilidades",
    },
  ];

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/app/employees">
                  Funcionários
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{employee.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="h-full w-full px-8 pb-8"
      >
        <TabsList className="h-auto rounded-none bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="geral">
          <Card className="mt-5 max-w-3xl">
            <CardHeader className="flex flex-col items-center gap-4 md:flex-row">
              <Avatar className="h-20 w-20">
                {/* 
                <AvatarImage
                  src={employee.photo ?? undefined}
                  alt={employee.name}
                /> 
              */}
                <AvatarFallback>
                  {employee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{employee.name}</CardTitle>
                <div className="mt-2 flex flex-wrap gap-3">
                  {employee.services.map((s) => (
                    <Badge key={s.id}>{s.name}</Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <div className="mt-5">
            <EmployeeServiceManager
              employeeId={employee.id}
              services={services}
              employeeServices={employee.services}
            />
          </div>
        </TabsContent>

        <TabsContent value="unavailabilities">
          <div className="mt-5">
            <EmployeeUnavailabilityForm
              employeeId={employee.id}
              unavailabilitiesItens={employee.unavailabilities}
            />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
