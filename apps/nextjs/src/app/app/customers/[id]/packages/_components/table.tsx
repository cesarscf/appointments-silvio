"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Info,
  Package,
  User,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Tipo de dados dos pacotes
type PackageType = {
  id: string;
  expiresAt: Date | null;
  employeeId: string | null;
  customerId: string;
  packageId: string;
  remainingSessions: number;
  totalSessions: number;
  purchasedAt: Date;
  paid: boolean;
  package: {
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
  };
  employee: {
    id: string;
    email: string | null;
    createdAt: Date;
    name: string;
    image: string | null;
    establishmentId: string;
    active: boolean;
    phone: string | null;
    address: string | null;
  } | null;
  customer: {
    id: string;
    email: string | null;
    createdAt: Date;
    name: string;
    establishmentId: string;
    address: string | null;
    birthDate: Date | null;
    phoneNumber: string;
    cpf: string | null;
    notes: string | null;
  };
};

export default function ClientPackagesTable({
  packages,
}: {
  packages: PackageType[];
}) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Não definido";
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Pacotes do Cliente</CardTitle>
        <CardDescription>
          Gerenciamento de pacotes adquiridos pelos clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Pacote</TableHead>
                <TableHead className="hidden md:table-cell">Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Sessões</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Data de Compra
                </TableHead>
                <TableHead className="hidden lg:table-cell">Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">
                  Profissional
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <>
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {pkg.package.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {pkg.customer.name}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">
                                {pkg.remainingSessions}
                              </span>
                              <span className="text-muted-foreground">/</span>
                              <span>{pkg.totalSessions}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sessões restantes / total</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(pkg.purchasedAt)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDate(pkg.expiresAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {pkg.paid ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Pago
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-800 hover:bg-red-100"
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {pkg.employee ? pkg.employee.name : "Não atribuído"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleRowExpansion(pkg.id)}
                        >
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Detalhes</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <ChevronDown className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>
                              Registrar sessão
                            </DropdownMenuItem>
                            <DropdownMenuItem>Alterar status</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Cancelar pacote
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRow === pkg.id && (
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={8} className="p-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <h4 className="mb-2 font-semibold">
                              Detalhes do Pacote
                            </h4>
                            <p className="text-sm">
                              Preço: {formatCurrency(pkg.package.packagePrice)}
                            </p>
                            <p className="text-sm">
                              Comissão: {pkg.package.commission}%
                            </p>
                            <p className="text-sm">
                              Descrição:{" "}
                              {pkg.package.description || "Sem descrição"}
                            </p>
                          </div>
                          <div>
                            <h4 className="mb-2 font-semibold">
                              Detalhes do Cliente
                            </h4>
                            <p className="text-sm">
                              Telefone: {pkg.customer.phoneNumber}
                            </p>
                            <p className="text-sm">
                              Email: {pkg.customer.email || "Não informado"}
                            </p>
                            <p className="text-sm">
                              CPF: {pkg.customer.cpf || "Não informado"}
                            </p>
                          </div>
                          {pkg.employee && (
                            <div>
                              <h4 className="mb-2 font-semibold">
                                Detalhes do Profissional
                              </h4>
                              <p className="text-sm">
                                Telefone:{" "}
                                {pkg.employee.phone || "Não informado"}
                              </p>
                              <p className="text-sm">
                                Email: {pkg.employee.email || "Não informado"}
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
