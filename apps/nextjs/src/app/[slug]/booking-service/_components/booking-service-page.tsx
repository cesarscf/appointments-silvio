"use client";

import React from "react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { z } from "zod";

import { AppRouter } from "@acme/api";
import { Employee } from "@acme/db/schema";

import { TimeSlotPicker } from "@/components/time-slot-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";
import { BookingSuccess } from "../../booking-employee/_components/booking-success";
import { BookingSummary } from "../../booking-employee/_components/booking-summary";
import { CustomerForm } from "./customer-form";
import { EmployeeSelection } from "./employee-selection";
import { ServiceInfoCard } from "./service-info-card";

export type PackageResult = Awaited<
  ReturnType<AppRouter["package"]["getById"]>
> | null;

const schema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  birthDate: z.coerce.date({
    required_error: "Data de nascimento é obrigatória",
    invalid_type_error: "Data inválida",
  }),
  phoneNumber: z.string().min(11, "Telefone deve ter 11 dígitos"),
  cpf: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});

export function BookingServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const serviceId = search.get("serviceId") ?? notFound();
  const servicePackageId = search.get("servicePackageId");

  const [step, setStep] = useQueryState("step", { defaultValue: "employee" });

  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);
  const [selectedSlot, setSelectedSlot] = React.useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [client, setClient] = React.useState<z.infer<typeof schema> | null>(
    null,
  );
  const [appointmentDetails, setAppointmentDetails] = React.useState<{
    serviceName: string;
    professionalName: string;
    date: string;
    time: string;
    duration: number;
    price: string;
  } | null>(null);

  // Data fetching
  const [data] = api.establishment.getEstablishmentBySlug.useSuspenseQuery({
    slug,
  });

  let servicePackage: PackageResult;

  if (servicePackageId) {
    [servicePackage] = api.package.getById.useSuspenseQuery({
      id: servicePackageId,
    });
  } else {
    servicePackage = null;
  }

  const [service] = api.service.getServiceById.useSuspenseQuery({
    id: serviceId,
  });
  const [employees] = api.service.getEmployeesByService.useSuspenseQuery({
    serviceId,
  });

  const { mutate: createAppointment, isPending: isCreatingAppointment } =
    api.appointment.publicCreateAppointment.useMutation({
      onSuccess: () => {
        if (selectedSlot && selectedEmployee) {
          setAppointmentDetails({
            serviceName: service.name,
            professionalName: selectedEmployee.name,
            date: format(selectedSlot.start, "PPPP", { locale: ptBR }),
            time: format(selectedSlot.start, "HH:mm"),
            duration: service.duration,
            price: service.price,
          });
          setStep("success");
        }
      },
      onError: (error) => toast.error(error.message),
    });

  function handleConfirmAppointment() {
    if (!selectedSlot || !client || !selectedEmployee) return;

    createAppointment({
      serviceId,
      establishmentId: data.id,
      employeeId: selectedEmployee.id,
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      customer: {
        name: client.name,
        cpf: client.cpf || "",
        birthDate: client.birthDate,
        phoneNumber: client.phoneNumber || "",
        email: client.email,
        address: client.address,
      },
      servicePackageId: servicePackageId ?? "",
    });
  }

  function nextStep() {
    const steps = ["employee", "date", "customer", "summary", "success"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]!);
    }
  }

  function backStep() {
    const steps = ["employee", "date", "customer", "summary", "success"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]!);
    } else {
      router.push(`/${data.slug}`);
    }
  }

  function handleBackToHome() {
    router.push(`/${data.slug}`);
  }

  function handleSelectEmployee(employee: Employee) {
    setSelectedEmployee(employee);
  }

  const notSelectEmployee = step === "employee" && !selectedEmployee;
  const notSelectSlot = step === "date" && !selectedSlot;
  const notCustomer = step === "customer" && !client;
  const disabledNext = notCustomer || notSelectSlot || notSelectEmployee;

  const stepTitles = {
    employee: "Escolha um profissional",
    date: "Escolha uma data e horário",
    customer: "Seus dados",
    summary: "Resumo do agendamento",
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-10">
      <Button
        className="absolute left-10 top-10"
        variant={"link"}
        onClick={() => {
          router.push(`/${slug}`);
        }}
      >
        <ArrowLeft />
        Voltar ao Menu
      </Button>
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
          {step === "success" && appointmentDetails ? (
            <BookingSuccess
              appointmentDetails={appointmentDetails}
              onBackToHome={handleBackToHome}
            />
          ) : (
            <>
              <ServiceInfoCard
                servicePackage={servicePackage}
                name={service.name}
                duration={service.duration}
                price={formatPrice(service.price)}
              />

              <h3 className="mb-3 font-medium">
                {stepTitles[step as keyof typeof stepTitles]}
              </h3>

              {step === "employee" && (
                <EmployeeSelection
                  employees={employees}
                  selectedEmployee={selectedEmployee}
                  onSelectEmployee={handleSelectEmployee}
                />
              )}

              {step === "date" && (
                <div className="flex flex-col gap-4">
                  <TimeSlotPicker
                    setSelectedSlot={setSelectedSlot}
                    establishmentId={data.id}
                    serviceId={serviceId}
                    employeeId={selectedEmployee?.id}
                  />
                  {selectedSlot && (
                    <div className="mt-4 rounded-md border bg-muted p-4">
                      <h3 className="font-medium">Seleção atual:</h3>
                      <p>
                        {format(selectedSlot.start, "PPPP", { locale: ptBR })}
                        {" às "}
                        {format(selectedSlot.start, "HH:mm")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === "customer" && (
                <CustomerForm
                  client={client}
                  onNextStep={nextStep}
                  setClient={setClient}
                  onBackStep={backStep}
                />
              )}

              {step === "summary" && selectedSlot && client && (
                <BookingSummary
                  service={{
                    name: service.name,
                    duration: service.duration,
                    price: service.price,
                  }}
                  professionalName={selectedEmployee?.name}
                  slot={selectedSlot}
                  customer={client}
                />
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {step === "summary" ? (
            <>
              <Button
                className="w-full"
                onClick={handleConfirmAppointment}
                disabled={isCreatingAppointment}
              >
                {isCreatingAppointment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  "Confirmar Agendamento"
                )}
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                onClick={backStep}
                disabled={isCreatingAppointment}
              >
                Voltar
              </Button>
            </>
          ) : step !== "success" && step !== "customer" ? (
            <>
              <Button
                className="w-full"
                onClick={nextStep}
                disabled={disabledNext}
              >
                Continuar
              </Button>
              <Button className="w-full" variant="ghost" onClick={backStep}>
                Voltar
              </Button>
            </>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
