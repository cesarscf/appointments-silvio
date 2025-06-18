"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/lib/utils";
import { api } from "@/trpc/react";

import React from "react";
import { toast } from "sonner";

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
  const [isUpdating, setIsUpdating] = React.useState(false);

  const apiUtils = api.useUtils();

  const updatePackage = api.package.updateActive.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado");
      apiUtils.package.getAll.invalidate();
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsUpdating(false);
    },
  });

  const handleStatusChange = async (checked: boolean, id: string) => {
    setIsUpdating(true);

    updatePackage.mutate({
      checked,
      id,
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {servicePackages.map((pkg) => {
        const unitPrice = Number(pkg.packagePrice) / pkg.quantity;
        return (
          <Card key={pkg.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">{pkg.name}</CardTitle>
                <div className="flex items-center justify-center flex-col gap-2">
                  <Badge variant={pkg.active ? "default" : "secondary"}>
                    {pkg.active ? "Ativo" : "Inativo"}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`loyalty-status-${pkg.id}`}
                      checked={pkg.active}
                      onCheckedChange={(prev) =>
                        handleStatusChange(prev, pkg.id)
                      }
                      disabled={isUpdating}
                    />
                    <Label
                      htmlFor={`loyalty-status-${pkg.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {pkg.active ? "Ativo" : "Inativo"}
                    </Label>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {pkg.service.name}
              </p>
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
                  <span>{formatPrice(unitPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
