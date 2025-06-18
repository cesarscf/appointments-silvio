"use client";

import Link from "next/link";
import { BadgePercent, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function PackagesList({
  packages,
  slug,
}: {
  packages: {
    description: string | null;
    id: string;
    createdAt: Date;
    name: string;
    establishmentId: string;
    active: boolean;
    serviceId: string;
    commission: string;
    quantity: number;
    packagePrice: string;
    image: string | null;
    service: {
      description: string | null;
      id: string;
      createdAt: Date;
      name: string;
      image: string | null;
      establishmentId: string;
      active: boolean;
      duration: number;
      price: string;
    };
  }[];
  slug: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((servicePackage) => {
        if (!servicePackage.active) return null;

        const regularPrice =
          Number.parseFloat(servicePackage.service.price) *
          servicePackage.quantity;
        const packagePrice = Number.parseFloat(servicePackage.packagePrice);
        const savings = regularPrice - packagePrice;
        const savingsPercentage = Math.round((savings / regularPrice) * 100);

        // Prioriza a imagem do pacote, depois a do serviço, ou usa placeholder
        const imageUrl =
          servicePackage.image ||
          servicePackage.service.image ||
          "/placeholder.svg?height=192&width=384";
        const imageAlt = servicePackage.image
          ? servicePackage.name
          : servicePackage.service.name;

        return (
          <Card
            key={servicePackage.id}
            className="group overflow-hidden transition-all duration-300 hover:shadow-lg"
          >
            <div className="relative h-48 w-full overflow-hidden bg-muted">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={imageAlt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {savingsPercentage > 0 && (
                <Badge className="absolute right-2 top-2 bg-green-600 text-white">
                  Economize {savingsPercentage}%
                </Badge>
              )}
              {/* Overlay gradient para melhor legibilidade do badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <CardHeader className="pb-2">
              <h3 className="text-xl font-bold">{servicePackage.name}</h3>
              <p className="text-sm text-muted-foreground">
                {servicePackage.service.name}
              </p>
            </CardHeader>

            <CardContent className="space-y-3 pb-0">
              {servicePackage.description && (
                <p className="text-sm text-muted-foreground">
                  {servicePackage.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <Package className="h-4 w-4" />
                  <span>{servicePackage.quantity}x sessões</span>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Preço normal:
                  </span>
                  <span className="text-sm line-through">
                    R$ {regularPrice.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <div className="flex items-center justify-between font-medium">
                  <span>Preço do pacote:</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {packagePrice.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex items-center justify-between rounded-md bg-green-50 p-2 dark:bg-green-950/30">
                    <div className="flex items-center gap-1 text-green-700 dark:text-green-400">
                      <BadgePercent className="h-4 w-4" />
                      <span className="font-medium">Economia:</span>
                    </div>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      R$ {savings.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="mt-4 border-t bg-muted/10 p-4">
              <Button asChild className="w-full">
                <Link
                  href={`/${slug}/booking-service?step=employee&serviceId=${servicePackage.service.id}&servicePackageId=${servicePackage.id}`}
                >
                  Agendar com este pacote
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
