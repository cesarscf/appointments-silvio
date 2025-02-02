"use client";

import { useParams } from "next/navigation";
import { Avatar } from "@radix-ui/react-avatar";
import { CalendarDays, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { CreateEmployeeServiceButton } from "./create-employee-service-button";

export function EmployeeDetails() {
  const { id } = useParams();

  const [employee] = api.employee.getById.useSuspenseQuery({
    employeeId: id as string,
  });
  const [services] = api.service.all.useSuspenseQuery();

  const apiUtils = api.useUtils();
  const deleteMutation = api.employee.deleteEmployeeService.useMutation({
    onSuccess: () => {
      toast.success("Serviço desvinculado do funcionário");
      void apiUtils.employee.getById.invalidate();
    },
  });

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

      <div className="mt-6 w-full px-8 pb-8">
        <Card className="max-w-3xl">
          <CardHeader className="flex flex-col items-center gap-4 md:flex-row">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={employee.photo ?? undefined}
                alt={employee.name}
              />
              <AvatarFallback>
                {employee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{employee.name}</CardTitle>
              <p className="text-sm text-muted-foreground">ID: {id}</p>
              <p className="text-sm text-muted-foreground">
                Store ID: {employee.storeId}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{employee.role}</Badge>
              </div>
              {employee.workingDays && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.workingDays}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-center gap-2">
                  <h3 className="mb-2 font-semibold">Serviços:</h3>
                  <CreateEmployeeServiceButton
                    services={services}
                    employeeId={employee.id}
                  />
                </div>

                <EmployeeServices
                  onDelete={(id) => {
                    deleteMutation.mutate({
                      employeeServiceId: id,
                    });
                  }}
                  items={employee.employeeServices}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function EmployeeServices({
  items,
  onDelete,
}: {
  items: {
    id: string;
    commission: string;
    service: {
      name: string;
    };
  }[];
  onDelete: (id: string) => void;
}) {
  return (
    <ul className="mt-4 grid gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col items-center justify-between gap-4 rounded-md bg-secondary p-3 md:flex-row"
        >
          <div className="flex gap-2">
            <h1 className="font-semibold">Nome do serviço:</h1>
            <span> {item.service.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{item.commission}% de comissão</Badge>
            <Button
              onClick={() => {
                onDelete(item.id);
              }}
              size={"icon"}
              variant={"destructive"}
            >
              <Trash2 />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
