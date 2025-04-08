import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { applyPhoneMask } from "@acme/utils";

import { Separator } from "@/components/ui/separator";
import { applyCpfMask, formatPrice } from "@/lib/utils";

interface BookingSummaryProps {
  service: {
    name: string;
    duration: number;
    price: string;
  };
  professionalName?: string;
  slot: {
    start: Date;
    end: Date;
  };
  customer: {
    name: string;
    phoneNumber?: string;
    email?: string;
    cpf?: string;
  };
}

export function BookingSummary({
  service,
  professionalName,
  slot,
  customer,
}: BookingSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h4 className="mb-3 font-medium">Resumo do Agendamento</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Serviço:</span>
            <span>{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profissional:</span>
            <span>{professionalName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data:</span>
            <span>{format(slot.start, "PPPP", { locale: ptBR })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Horário:</span>
            <span>{format(slot.start, "HH:mm")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duração:</span>
            <span>{service.duration} minutos</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>{formatPrice(service.price)}</span>
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
              <span className="text-muted-foreground">Telefone:</span>
              <span>{applyPhoneMask(customer.phoneNumber)}</span>
            </div>
          )}
          {customer.email && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">E-mail:</span>
              <span>{customer.email}</span>
            </div>
          )}
          {customer.cpf && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">CPF:</span>
              <span>{applyCpfMask(customer.cpf)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
