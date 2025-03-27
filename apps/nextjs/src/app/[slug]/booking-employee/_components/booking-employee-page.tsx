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
import { Loader2 } from "lucide-react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { z } from "zod";

import { BookingSuccess } from "@/app/[slug]/booking-employee/_components/booking-success";
import { BookingSummary } from "@/app/[slug]/booking-employee/_components/booking-summary";
import { SelectedServiceInfo } from "@/app/[slug]/booking-employee/_components/selected-service-info";
import { ServiceSelection } from "@/app/[slug]/booking-employee/_components/service-selection";
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
import { CustomerForm } from "../../booking-service/_components/customer-form";

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

export function BookingEmployeePage() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const employeeId = search.get("employeeId") ?? notFound();
  const [step, setStep] = useQueryState("step", { defaultValue: "service" });

  const [selectedSlot, setSelectedSlot] = React.useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedServiceId, setSelectedServiceId] = React.useState<
    string | null
  >(null);
  const [customer, setCustomer] = React.useState<z.infer<typeof schema> | null>(
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
  const [establishment] =
    api.establishment.getEstablishmentBySlug.useSuspenseQuery({ slug });
  const [services] = api.service.getServicesByEmployee.useSuspenseQuery({
    employeeId,
  });
  const { data: employee } = api.employee.publicGetEmployeeById.useQuery({
    id: employeeId,
  });
  const { data: selectedService } = api.service.getServiceById.useQuery(
    { id: selectedServiceId ?? "" },
    { enabled: !!selectedServiceId },
  );

  const { mutate: createAppointment, isPending: isCreatingAppointment } =
    api.appointment.publicCreateAppointment.useMutation({
      onSuccess: () => {
        if (selectedSlot && selectedService && employee) {
          setAppointmentDetails({
            serviceName: selectedService.name,
            professionalName: employee.name,
            date: format(selectedSlot.start, "PPPP", { locale: ptBR }),
            time: format(selectedSlot.start, "HH:mm"),
            duration: selectedService.duration,
            price: selectedService.price,
          });
          setStep("success");
        }
      },
      onError: (error) => toast.error(error.message),
    });

  function handleConfirmAppointment() {
    if (!selectedSlot || !customer || !selectedServiceId || !employeeId) return;

    createAppointment({
      serviceId: selectedServiceId,
      establishmentId: establishment.id,
      employeeId,
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      customer: {
        name: customer.name,
        cpf: customer.cpf || "",
        birthDate: customer.birthDate,
        phoneNumber: customer.phoneNumber || "",
        email: customer.email,
        address: customer.address,
      },
    });
  }

  function nextStep() {
    const steps = ["service", "date", "customer", "summary", "success"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]!);
    }
  }

  function backStep() {
    const steps = ["service", "date", "customer", "summary", "success"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]!);
    } else {
      router.push(`/${establishment.slug}`);
    }
  }

  function handleBackToHome() {
    router.push(`/${establishment.slug}`);
  }

  function handleSelectService(serviceId: string) {
    setSelectedServiceId(serviceId);
  }

  const notSelectEmployee = step === "service" && !selectedServiceId;
  const notSelectSlot = step === "date" && !selectedSlot;
  const notCustomer = step === "customer" && !customer;
  const disabledNext = notCustomer || notSelectSlot || notSelectEmployee;

  const stepTitles = {
    service: "Escolha um serviço",
    date: "Escolha uma data e horário",
    customer: "Seus dados",
    summary: "Resumo do agendamento",
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{establishment.name}</CardTitle>
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
              {selectedService && (
                <SelectedServiceInfo
                  name={selectedService.name}
                  duration={selectedService.duration}
                  price={formatPrice(selectedService.price)}
                />
              )}

              <h3 className="mb-3 font-medium">
                {stepTitles[step as keyof typeof stepTitles]}
              </h3>

              {step === "service" && (
                <ServiceSelection
                  services={services}
                  selectedServiceId={selectedServiceId}
                  professionalName={employee?.name}
                  onSelectService={handleSelectService}
                />
              )}

              {step === "date" && selectedService && (
                <div className="flex flex-col gap-4">
                  <TimeSlotPicker
                    setSelectedSlot={setSelectedSlot}
                    establishmentId={establishment.id}
                    serviceId={selectedService.id}
                    employeeId={employeeId}
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
                  client={customer}
                  onNextStep={nextStep}
                  setClient={setCustomer}
                  onBackStep={backStep}
                />
              )}

              {step === "summary" &&
                selectedSlot &&
                customer &&
                selectedService && (
                  <BookingSummary
                    service={{
                      name: selectedService.name,
                      duration: selectedService.duration,
                      price: selectedService.price,
                    }}
                    professionalName={employee?.name}
                    slot={selectedSlot}
                    customer={customer}
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
