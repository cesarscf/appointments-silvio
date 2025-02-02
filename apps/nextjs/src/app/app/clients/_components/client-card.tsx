import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Edit,
  FileUser,
  MailIcon,
  MapPinHouse,
  PhoneIcon,
  Trash2,
} from "lucide-react";

import type { Client } from "@acme/db/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { UpdateClientButton } from "./update-client-button";

export function ClientCard({
  client,
  onDelete,
}: {
  client: Client;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex items-center space-x-4 p-4">
        <div className="flex-1 space-y-1">
          <p className="text-md mb-2 font-medium leading-none">{client.name}</p>
          <div className="flex items-center text-sm text-muted-foreground">
            <PhoneIcon className="mr-1 h-4 w-4" />
            {client.phone}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            {format(client.birthDate, "PPP", { locale: ptBR })}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MailIcon className="mr-1 h-4 w-4" />
            {client.email == "" || client.email == null
              ? "Não informado"
              : client.email}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <FileUser className="mr-1 h-4 w-4" />

            {client.cpf == "" || client.cpf == null
              ? "Não informado"
              : client.cpf}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPinHouse className="mr-1 h-4 w-4" />

            {client.address == "" || client.address == null
              ? "Não informado"
              : client.address}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <UpdateClientButton client={client}>
          <Button variant="outline" size="sm" className="w-full">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </UpdateClientButton>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onDelete(client.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
