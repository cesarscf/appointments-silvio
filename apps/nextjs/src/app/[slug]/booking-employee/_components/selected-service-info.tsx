import { Clock, DollarSign } from "lucide-react";

interface SelectedServiceInfoProps {
  name: string;
  duration: number;
  price: string;
}

export function SelectedServiceInfo({
  name,
  duration,
  price,
}: SelectedServiceInfoProps) {
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
    </div>
  );
}
