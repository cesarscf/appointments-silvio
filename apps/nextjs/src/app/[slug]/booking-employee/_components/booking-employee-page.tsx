"use client";

import React from "react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { AvatarImage } from "@radix-ui/react-avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Clock, DollarSign, Loader2, MessageCircle } from "lucide-react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { z } from "zod";

import { TimeSlotPicker } from "@/components/time-slot-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  // Dados do estabelecimento
  const [establishment] =
    api.establishment.getEstablishmentBySlug.useSuspenseQuery({ slug });

  // Dados dos serviços do profissional
  const [services] = api.service.getServicesByEmployee.useSuspenseQuery({
    employeeId,
  });

  // Dados do profissional
  const { data: employee } = api.employee.publicGetEmployeeById.useQuery({
    id: employeeId,
  });

  // Dados do serviço selecionado
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
          {step === "success" ? (
            <div className="space-y-6">
              <div className="rounded-lg bg-green-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-green-800">
                  Agendamento confirmado!
                </h3>
                <p className="text-green-600">
                  Você receberá as informações por WhatsApp em breve.
                </p>
              </div>

              {appointmentDetails && (
                <>
                  <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Detalhes do agendamento</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Serviço:</span>
                        <span>{appointmentDetails.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Profissional:
                        </span>
                        <span>{appointmentDetails.professionalName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data:</span>
                        <span>{appointmentDetails.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horário:</span>
                        <span>{appointmentDetails.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração:</span>
                        <span>{appointmentDetails.duration} minutos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor:</span>
                        <span>{formatPrice(appointmentDetails.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <h3 className="mb-2 font-medium text-blue-800">
                      Importante
                    </h3>
                    <p className="text-sm text-blue-600">
                      Chegue com 15 minutos de antecedência. Em caso de
                      cancelamento, avise com pelo menos 24 horas de
                      antecedência.
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {selectedService && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="mb-2 font-medium">{selectedService.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedService.duration} minutos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatPrice(selectedService.price)}</span>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="mb-3 font-medium">
                {step === "service" && "Escolha um serviço"}
                {step === "date" && "Escolha uma data e horário"}
                {step === "customer" && "Seus dados"}
                {step === "summary" && "Resumo do agendamento"}
              </h3>

              {step === "service" && (
                <div className="space-y-2">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent",
                        selectedServiceId === service.id && "bg-accent",
                      )}
                      onClick={() => handleSelectService(service.id)}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {service.name.charAt(0)}
                        </AvatarFallback>
                        <AvatarImage src="/placeholder.svg" />
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {employee?.name || "Profissional"}
                        </p>
                      </div>
                      {selectedServiceId === service.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
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
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-3 font-medium">
                        Resumo do Agendamento
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Serviço:
                          </span>
                          <span>{selectedService.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Profissional:
                          </span>
                          <span>{employee?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data:</span>
                          <span>
                            {format(selectedSlot.start, "PPPP", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Horário:
                          </span>
                          <span>{format(selectedSlot.start, "HH:mm")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Duração:
                          </span>
                          <span>{selectedService.duration} minutos</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>{formatPrice(selectedService.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="mb-3 font-medium">Dados do Cliente</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome:</span>
                          <span>{customer.name}</span>
                        </div>
                        {customer.phoneNumber && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Telefone:
                            </span>
                            <span>{customer.phoneNumber}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              E-mail:
                            </span>
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.cpf && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">CPF:</span>
                            <span>{customer.cpf}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {step === "success" ? (
            <Button className="w-full" onClick={handleBackToHome}>
              Voltar para a página inicial
            </Button>
          ) : step === "summary" ? (
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
          ) : step !== "customer" ? (
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
