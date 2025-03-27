import { Check } from "lucide-react";

import { Service } from "@acme/db/schema";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ServiceSelectionProps {
  services: Service[];
  selectedServiceId: string | null;
  professionalName?: string;
  onSelectService: (serviceId: string) => void;
}

export function ServiceSelection({
  services,
  selectedServiceId,
  professionalName,
  onSelectService,
}: ServiceSelectionProps) {
  return (
    <div className="space-y-2">
      {services.map((service) => (
        <div
          key={service.id}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent",
            selectedServiceId === service.id && "bg-accent",
          )}
          onClick={() => onSelectService(service.id)}
        >
          <Avatar>
            <AvatarFallback>{service.name.charAt(0)}</AvatarFallback>
            <AvatarImage src="/placeholder.svg" />
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{service.name}</p>
            <p className="text-xs text-muted-foreground">
              {professionalName || "Profissional"}
            </p>
          </div>
          {selectedServiceId === service.id && (
            <Check className="h-5 w-5 text-primary" />
          )}
        </div>
      ))}
    </div>
  );
}
