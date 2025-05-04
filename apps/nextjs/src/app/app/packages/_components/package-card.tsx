"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface ServicePackage {
  id: string;
  name: string;
  active: boolean;
  quantity: number;
  packagePrice: string;
  commission: string;
  service: {
    id: string;
    name: string;
    price: string;
    duration: number;
  };
}

interface ServicePackageCardProps {
  servicePackages: ServicePackage[];
}

export default function ServicePackageCard({
  servicePackages,
}: ServicePackageCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {servicePackages.map((pkg) => (
        <Card key={pkg.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">{pkg.name}</CardTitle>
              <Badge variant={pkg.active ? "default" : "secondary"}>
                {pkg.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{pkg.service.name}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Preço do pacote:</span>
                <span className="text-lg font-bold">
                  {formatPrice(Number.parseFloat(pkg.packagePrice))}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quantidade:</span>
                <span>
                  {pkg.quantity} {pkg.quantity > 1 ? "serviços" : "serviço"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Comissão:</span>
                <span>{pkg.commission}%</span>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Preço unitário:</span>
                <span>{formatPrice(Number.parseFloat(pkg.service.price))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
