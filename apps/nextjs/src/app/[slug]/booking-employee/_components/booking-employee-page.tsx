"use client";

import React from "react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Check } from "lucide-react";
import { useQueryState } from "nuqs";

import { Service } from "@acme/db/schema";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function BookingEmployeePage() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const employeeId = search.get("employeeId") ?? notFound();
  const [step, setStep] = useQueryState("step", { defaultValue: "employee" });

  const [selectedService, setSelectedService] = React.useState<Service | null>(
    null,
  );

  const [data] = api.establishment.getEstablishmentBySlug.useSuspenseQuery({
    slug,
  });
  const [services] = api.service.getServicesByEmployee.useSuspenseQuery({
    employeeId,
  });

  return (
    <div>
      <h1>BookingEmployeePage</h1>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{data.name}</CardTitle>
          <CardDescription>
            {step === "success"
              ? "Agendamento concluído"
              : "Agendamento de serviço"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "employee" && (
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent",
                    selectedService?.id === service.id && "bg-accent",
                  )}
                  onClick={() => setSelectedService(service)}
                >
                  <Avatar>
                    <AvatarFallback>{service.name.charAt(0)}</AvatarFallback>
                    <AvatarImage src="/placeholder.svg" />
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Profissional
                    </p>
                  </div>
                  {selectedService?.id === service.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
