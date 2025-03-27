"use client";

import React from "react";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Check, Clock, DollarSign, User } from "lucide-react";
import { useQueryState } from "nuqs";

import TimeSlotPicker from "@/components/time-slot-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn, formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";

export function BookingServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();

  const serviceId = search.get("serviceId") ?? notFound();

  const [step, setStep] = useQueryState("step", {
    defaultValue: "employee",
  });

  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    string | null
  >(null);
  const [selectedSlot, setSelectedSlot] = React.useState<{
    start: Date;
    end: Date;
  } | null>(null);

  const [data] = api.establishment.getEstablishmentBySlug.useSuspenseQuery({
    slug,
  });

  const [service] = api.service.getServiceById.useSuspenseQuery({
    id: serviceId,
  });

  const [employees] = api.service.getEmployeesByService.useSuspenseQuery({
    serviceId,
  });

  function nextStep() {
    step === "employee" ? setStep("date") : setStep("employee");
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{data.name}</CardTitle>
          <CardDescription>Agendamento de serviço</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="mb-2 font-medium">{service.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{service.duration} minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{formatPrice(service.price)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-medium">Escolha um profissional</h3>
            {step === "employee" && (
              <div className="space-y-2">
                <div
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent",
                    selectedEmployeeId === null && "bg-accent",
                  )}
                  onClick={() => setSelectedEmployeeId(null)}
                >
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">Qualquer profissional</p>
                    <p className="text-xs text-muted-foreground">
                      Sem preferência específica
                    </p>
                  </div>
                  {selectedEmployeeId === null && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>

                <Separator className="my-2" />

                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent",
                      selectedEmployeeId === employee.id && "bg-accent",
                    )}
                    onClick={() => setSelectedEmployeeId(employee.id)}
                  >
                    <Avatar>
                      <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      <AvatarImage
                        src={`/placeholder.svg?height=40&width=40`}
                      />
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Profissional
                      </p>
                    </div>
                    {selectedEmployeeId === employee.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {step === "date" && (
              <div className="flex flex-col gap-4">
                <TimeSlotPicker
                  setSelectedSlot={setSelectedSlot}
                  establishmentId={data.id}
                  serviceId={serviceId}
                  employeeId={selectedEmployeeId ?? undefined}
                />
                {selectedSlot && (
                  <div className="mt-4 rounded-md border bg-muted p-4">
                    <h3 className="font-medium">
                      Seleção atual (apenas no estado):
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Início: {selectedSlot.start.toString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fim: {selectedSlot.end.toString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            disabled={selectedEmployeeId === undefined}
            onClick={nextStep}
          >
            Continuar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
