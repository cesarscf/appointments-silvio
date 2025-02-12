"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { formatDate } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function Calendar() {
  const [appointments] = api.appointment.all.useSuspenseQuery();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Agenda</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button className="ml-auto mr-4" asChild>
          <Link href={`/app/calendar/new?today=${new Date().toISOString()}`}>
            Adicionar
          </Link>
        </Button>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="max-w-6xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Funcionário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.client.name}</TableCell>
                  <TableCell>
                    {formatDate(new Date(appointment.date))}
                  </TableCell>
                  <TableCell>
                    <Badge className="uppercase">{appointment.status}</Badge>
                  </TableCell>
                  <TableCell>{appointment.checkIn ? "Sim" : "Não"}</TableCell>
                  <TableCell>{appointment.service.name}</TableCell>
                  <TableCell>{appointment.employee.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
