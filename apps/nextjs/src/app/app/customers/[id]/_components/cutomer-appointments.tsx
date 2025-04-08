"use client";

import { useParams, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateWithHour } from "@/lib/utils";
import { api } from "@/trpc/react";

export function CustomerAppointments() {
  const { id } = useParams();
  const [appointments] = api.customer.listCustomerAppointments.useSuspenseQuery(
    {
      id: id as string,
    },
  );

  const [customer] = api.customer.getCustomerById.useSuspenseQuery({
    id: id as string,
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/app/employees">Clientes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{customer.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Histórico de agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Cliente</TableHead>
                    <TableHead className="w-[150px]">Data</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[100px]">Check-in</TableHead>
                    <TableHead className="w-[150px]">Serviço</TableHead>
                    <TableHead className="w-[150px]">Funcionário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhum agendamento encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appointment) => (
                      <TableRow
                        key={appointment.id}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {appointment.customer.name}
                        </TableCell>
                        <TableCell>
                          {formatDateWithHour(appointment.startTime)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getStatusBadgeColor(appointment.status)} px-2 py-1`}
                          >
                            {appointment.status === "scheduled"
                              ? "Agendado"
                              : "Concluído"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {appointment.checkin ? "Feito" : "Não realizado"}
                        </TableCell>
                        <TableCell>{appointment.service.name || "-"}</TableCell>
                        <TableCell>
                          {appointment.employee.name || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
