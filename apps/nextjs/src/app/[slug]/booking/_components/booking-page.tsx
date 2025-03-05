"use client";

import React from "react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useQueryState } from "nuqs";

import { Employee } from "@acme/db/schema";

import { cn, formatPrice, formatTime } from "@/lib/utils";
import { api } from "@/trpc/react";
import { SelectEmployee } from "./select-employee";

export function BookingPage() {
  const router = useRouter();

  const { slug } = useParams();

  const search = useSearchParams();
  const [step, setStep] = useQueryState("step", {
    defaultValue: "employee",
  });

  const serviceId = search.get("serviceId");

  if (!serviceId) return;

  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);

  const [data] = api.store.getBySlug.useSuspenseQuery({
    slug: slug as string,
  });

  const [service] = api.service.byId.useSuspenseQuery(serviceId);

  if (!data) {
    return notFound();
  }

  function nextStep(step: string) {
    setStep(step);
  }

  return (
    <div
      className={cn(`theme-${data.theme} mx-auto mt-8 min-h-screen max-w-3xl`)}
    >
      <div className="container mx-auto py-10">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Agendamento de Serviço
        </h1>

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

        <div>
          {step === "employee" && (
            <SelectEmployee
              employees={data.employees}
              onEmployeeSelect={setSelectedEmployee}
              selectedEmployeeId={selectedEmployee?.id}
              onNextStep={() => setStep("date")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
