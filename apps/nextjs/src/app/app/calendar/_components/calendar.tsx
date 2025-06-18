"use client";
import { CheckCircle, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
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
import { CheckinButton } from "./checkin-button";
import { PeriodFilter } from "./period-filter";
import { usePeriodFilter } from "./use-period-filter";

export default function Calendar() {
  const { startDate, endDate } = usePeriodFilter();

  const { data: appointments, isLoading } =
    api.appointment.listAppointmentsByPeriod.useQuery({
      startDate,
      endDate,
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
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-lg font-semibold">
                  Agenda
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4">
              <CardTitle>Agendamentos</CardTitle>
              <PeriodFilter />
            </div>
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Carregando agendamentos...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : appointments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhum agendamento encontrado para o período
                        selecionado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments?.map((appointment) => (
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
                          {appointment.checkin ? (
                            <Badge
                              variant="secondary"
                              className="border-green-200 bg-green-50 text-green-700"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" /> Realizado
                            </Badge>
                          ) : (
                            <CheckinButton
                              appointmentId={appointment.id}
                              packageAppoint={
                                appointment.packageAppointment?.package
                              }
                              servicePrice={appointment.service.price}
                            />
                          )}
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
