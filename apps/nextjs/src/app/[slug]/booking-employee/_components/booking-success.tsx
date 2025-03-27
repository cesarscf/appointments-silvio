import { Check, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface BookingSuccessProps {
  appointmentDetails: {
    serviceName: string;
    professionalName: string;
    date: string;
    time: string;
    duration: number;
    price: string;
  };
  onBackToHome: () => void;
}

export function BookingSuccess({
  appointmentDetails,
  onBackToHome,
}: BookingSuccessProps) {
  return (
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

      <Card>
        <CardContent className="p-4">
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
              <span className="text-muted-foreground">Profissional:</span>
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
        </CardContent>
      </Card>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <h3 className="mb-2 font-medium text-blue-800">Importante</h3>
        <p className="text-sm text-blue-600">
          Chegue com 15 minutos de antecedência. Em caso de cancelamento, avise
          com pelo menos 24 horas de antecedência.
        </p>
      </div>

      <Button className="w-full" onClick={onBackToHome}>
        Voltar para a página inicial
      </Button>
    </div>
  );
}
