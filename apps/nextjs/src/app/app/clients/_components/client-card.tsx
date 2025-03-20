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

import type { Customer } from "@acme/db/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { applyCpfMask, applyPhoneMask } from "@/lib/utils";
import { UpdateCustomerButton } from "./update-client-button";

export function CustomerCard({
  customer,
  onDelete,
}: {
  customer: Customer;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex items-center space-x-4 p-4">
        <div className="flex-1 space-y-1">
          <p className="text-md mb-2 font-medium leading-none">
            {customer.name}
          </p>
          <div className="flex items-center text-sm text-muted-foreground">
            <PhoneIcon className="mr-1 h-4 w-4" />
            {applyPhoneMask(customer.phoneNumber ?? "")}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            {format(customer.birthDate, "PPP", { locale: ptBR })}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MailIcon className="mr-1 h-4 w-4" />
            {customer.email == "" || customer.email == null
              ? "Não informado"
              : customer.email}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <FileUser className="mr-1 h-4 w-4" />

            {customer.cpf == "" || customer.cpf == null
              ? "Não informado"
              : applyCpfMask(customer.cpf)}
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPinHouse className="mr-1 h-4 w-4" />

            {customer.address == "" || customer.address == null
              ? "Não informado"
              : customer.address}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <UpdateCustomerButton customer={customer}>
          <Button variant="outline" size="sm" className="w-full">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </UpdateCustomerButton>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => onDelete(customer.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
