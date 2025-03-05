"use client";

import React from "react";
import Image from "next/image";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { CalendarCheck, Clock, CreditCard, User } from "lucide-react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { z } from "zod";

import type { Employee } from "@acme/db/schema";
import { createClientSchema } from "@acme/validators";

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
import {
  cn,
  formatDate,
  formatDateWithHour,
  formatPrice,
  formatTime,
} from "@/lib/utils";
import { api } from "@/trpc/react";
import { ClientForm } from "./client-form";
import { SelectDate } from "./select-date";
import { SelectEmployee } from "./select-employee";

export function BookingPage() {
  const { slug } = useParams();
  const router = useRouter();

  const search = useSearchParams();
  const [step, setStep] = useQueryState("step", {
    defaultValue: "employee",
  });

  const serviceId = search.get("serviceId");

  if (!serviceId) return;

  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [client, setClient] = React.useState<z.infer<
    typeof createClientSchema
  > | null>(null);

  const [data] = api.store.getBySlug.useSuspenseQuery({
    slug: slug as string,
  });

  const [service] = api.service.byId.useSuspenseQuery(serviceId);

  if (!data) {
    return notFound();
  }

  const apiUtils = api.useUtils();

  const createMutation = api.appointment.create.useMutation({
    onSuccess: () => {
      toast.success("Agendamento realizado.");
    },
  });

  return (
    <div
      className={cn(`theme-${data.theme} mx-auto mt-8 min-h-screen max-w-3xl`)}
    >
      <div className="container mx-auto py-10">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Agendamento de Serviço
        </h1>

        {step === "summary" ? null : (
          <div className="mb-6 rounded-lg bg-muted p-4">
            <h2 className="font-medium">Serviço selecionado:</h2>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">{service.name}</p>
              <p className="text-lg">R$ {formatPrice(service.price)}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Duração: {formatTime(String(service.estimatedTime))} minutos
            </p>
          </div>
        )}

        <div>
          {step === "employee" && (
            <SelectEmployee
              employees={data.employees}
              onEmployeeSelect={setSelectedEmployee}
              selectedEmployeeId={selectedEmployee?.id}
              onNextStep={() => setStep("date")}
              onBackStep={() => router.back()}
            />
          )}
          {step === "date" && (
            <SelectDate
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onNextStep={() => setStep("client")}
              onBackStep={() => setStep("employee")}
            />
          )}

          {step === "client" && (
            <div>
              <ClientForm
                client={client}
                setClient={setClient}
                onNextStep={() => setStep("summary")}
                onBackStep={() => setStep("date")}
              />
            </div>
          )}
          {step === "summary" && (
            <Card className="overflow-hidden border-2 shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <CalendarCheck className="h-6 w-6" />
                  Resumo do Agendamento
                </CardTitle>
                <CardDescription>
                  Confirme os detalhes do seu agendamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-medium">Serviço</h2>
                  </div>
                  <Separator className="mb-3" />
                  <div className="flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">{service.name}</p>
                      <p className="rounded-full bg-primary/10 px-3 py-1 text-lg font-semibold text-primary">
                        R$ {formatPrice(service.price)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <p className="text-sm">
                        {formatTime(String(service.estimatedTime))} minutos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-medium">Profissional</h2>
                  </div>
                  <Separator className="mb-3" />
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm">
                      <Image
                        src={"/placeholder.svg"}
                        alt={`${selectedEmployee?.name} foto`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">
                        {selectedEmployee?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedEmployee?.role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-medium">Data e Horário</h2>
                  </div>
                  <Separator className="mb-3" />
                  <p className="text-lg font-medium">
                    {formatDateWithHour(selectedDate)}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-medium">Suas informações</h2>
                  </div>
                  <Separator className="mb-3" />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{client?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {client?.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(client?.birthday!)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 bg-primary/5 p-6">
                <Button
                  size="lg"
                  className="w-full text-base font-medium shadow-md transition-all hover:scale-[1.02]"
                >
                  Confirmar Agendamento
                </Button>
                <Button
                  onClick={() => setStep("date")}
                  variant="outline"
                  className="w-full border-primary/20"
                >
                  Voltar e Editar
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
