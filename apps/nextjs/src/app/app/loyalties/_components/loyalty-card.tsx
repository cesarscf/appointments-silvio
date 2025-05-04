import { useRouter } from "next/navigation";
import { Gift, Star } from "lucide-react";

import { AppRouter } from "@acme/api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoyaltyCardProps {
  loyalty: {
    description: string | null;
    id: string;
    createdAt: Date;
    name: string;
    establishmentId: string;
    active: boolean;
    serviceId: string;
    pointsPerService: number;
    requiredPoints: number;
    bonusServiceId: string;
    bonusQuantity: number;
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
    bonusService: {
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
  };
}

export function LoyaltyCard({ loyalty }: LoyaltyCardProps) {
  const router = useRouter();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{loyalty.name}</CardTitle>
          {loyalty.active ? (
            <Badge
              variant="default"
              className="bg-green-500 hover:bg-green-600"
            >
              Ativo
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-500">
              Inativo
            </Badge>
          )}
        </div>
        <CardDescription>
          {loyalty.description || "Sem descrição disponível"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Serviço
            </div>
            <div className="font-medium">{loyalty.service.name}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Pontos por serviço
            </div>
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4 text-yellow-500" />
              <span className="font-medium">{loyalty.pointsPerService}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Pontos necessários
            </div>
            <div className="font-medium">{loyalty.requiredPoints}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Bônus
            </div>
            <div className="flex items-center">
              <Gift className="mr-1 h-4 w-4 text-primary" />
              <span className="font-medium">
                {loyalty.bonusQuantity} x {loyalty.bonusService.name}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            router.push(`/app/loyalties/${loyalty.id}`);
          }}
          variant="outline"
          className="w-full"
        >
          Clientes associados
        </Button>
      </CardFooter>
    </Card>
  );
}
