import Image from "next/image";
import { Clock, Edit, Trash2 } from "lucide-react";

import type { Category, Service } from "@acme/db/schema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateServiceButton } from "./update-service-button";

interface ServiceCardProps {
  categories: Category[];
  service: Service;
  onDelete: (id: string) => void;
  deleteIsPending: boolean;
}

export function ServiceCard({
  categories,
  service,
  onDelete,
  deleteIsPending,
}: ServiceCardProps) {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="p-0">
        {service.image ? (
          <Image
            src={service.image || "/placeholder.svg"}
            alt={service.name}
            width={384}
            height={200}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-gray-200">
            <span className="text-gray-400">Sem imagem</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="mb-2 text-xl">{service.name}</CardTitle>
        {service.description && (
          <p className="mb-4 text-sm text-gray-600">{service.description}</p>
        )}
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="secondary" className="text-lg">
            {service.price}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-1 h-4 w-4" />
            <span>{service.estimatedTime} min</span>
          </div>
        </div>
        <div className="flex justify-between">
          <UpdateServiceButton categories={categories} service={service}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </UpdateServiceButton>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(service.id)}
            disabled={deleteIsPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
