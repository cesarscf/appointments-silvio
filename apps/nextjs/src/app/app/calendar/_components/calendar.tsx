"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, PlusCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, formatDateWithHour } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function Calendar() {
  const [appointments, { refetch }] =
    api.appointment.listAppointments.useSuspenseQuery();
  // const checkInMutation = api.appointment.checkIn.useMutation({
  //   onSuccess: () => {
  //     refetch()
  //   },
  // })

  // const [loadingCheckIn, setLoadingCheckIn] = useState<string | null>(null)

  // const handleCheckIn = async (appointmentId: string) => {
  //   try {
  //     setLoadingCheckIn(appointmentId)
  //     await checkInMutation.mutateAsync({ appointmentId })
  //   } finally {
  //     setLoadingCheckIn(null)
  //   }
  // }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="ml-auto" size="sm" asChild>
                <Link
                  href={`/app/calendar/new?today=${new Date().toISOString()}`}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Agendamento
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar novo agendamento</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Agendamentos</CardTitle>
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
                            className={`${getStatusBadgeColor("pending")} px-2 py-1`}
                          >
                            Agendado
                            {/* {appointment.status} */}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {false ? (
                            <Badge
                              variant="outline"
                              className="border-green-200 bg-green-50 text-green-700"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" /> Realizado
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-20"
                            >
                              Não
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {appointment.service.name || "-"}
                        </TableCell>
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
