import { Clock, DollarSign, Package } from "lucide-react";

import { PackageResult } from "./booking-service-page";

interface ServiceInfoCardProps {
  name: string;
  duration: number;
  price: string;
  servicePackage: PackageResult;
}

export function ServiceInfoCard({
  name,
  duration,
  price,
  servicePackage,
}: ServiceInfoCardProps) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <h3 className="mb-2 font-medium">{name}</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{duration} minutos</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>{price}</span>
        </div>
      </div>

      {servicePackage && (
        <div className="mt-4 rounded-md bg-yellow-500/20 p-3 text-sm">
          <div className="text-yebg-yellow-300 font-med5um flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>
              {servicePackage.name} - {servicePackage.quantity} serviços
            </span>
          </div>

          <p className="mt-2 text-muted-foreground">
            Você está agendando este serviço como parte do pacote. Nas próximas
            vezes que agendar serviços deste pacote, o sistema irá detectar
            automaticamente e aplicar os benefícios.
          </p>
        </div>
      )}
    </div>
  );
}
