"use client";

import React from "react";
import Image from "next/image";
import { Clock, Edit, Trash2 } from "lucide-react";

import type { Category, Service } from "@acme/db/schema";

import { DeleteConfirmationModal } from "@/components/confirm-delete-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatTime } from "@/lib/utils";
import { UpdateServiceButton } from "./update-service-button";

interface ServiceCardProps {
  categories: Category[];
  service: Service & {
    categories: {
      id: string | undefined;
      name: string | undefined;
    }[];
  };
  onDelete: (id: string) => void;
  deleteIsPending: boolean;
}

export function ServiceCard({
  categories,
  service,
  onDelete,
  deleteIsPending,
}: ServiceCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const image =
    service.image === ""
      ? "/placeholder.svg"
      : (service.image ?? "/placeholder.svg");
  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardHeader className="relative h-48 p-0">
          <Image
            src={image}
            alt={`${service.name} Logo`}
            fill
            className="object-cover"
          />
        </CardHeader>
        <CardContent className="relative space-y-2 p-4">
          <Badge
            className="absolute right-2 top-2"
            variant={service.active ? "default" : "destructive"}
          >
            {service.active ? "Ativo" : "Desativado"}
          </Badge>
          <CardTitle className="text-xl">{service.name}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {service.categories.map((category) => (
              <Badge key={category.id}>{category.name}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-lg">
              {formatPrice(service.price)}
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="mr-1 h-4 w-4" />
              <span>{formatTime(service.duration.toString())} min</span>
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
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={deleteIsPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete(service.id);
          setIsDeleteModalOpen(false);
        }}
        title="Confirmar exclusão"
        description={`Tem certeza de que deseja excluir ${service.name}? Essa ação é irreversível e todos os itens relacionados a este serviço também serão excluídos.`}
      />
    </>
  );
}
