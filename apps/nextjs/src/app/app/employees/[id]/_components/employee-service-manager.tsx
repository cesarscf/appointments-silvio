"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Service } from "@acme/db/schema";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";

interface EmployeeServiceManagerProps {
  employeeId: string;
  employeeServices: {
    id: string;
    name: string;
    price: string;
    commission: string;
  }[];
  services: Service[];
}

export function EmployeeServiceManager({
  employeeId,
  services,
  employeeServices,
}: EmployeeServiceManagerProps) {
  const [selectedService, setSelectedService] = React.useState("");
  const [newCommission, setNewCommission] = React.useState("");
  const [editCommission, setEditCommission] = React.useState("");
  const [editingService, setEditingService] = React.useState<string | null>(
    null,
  );

  const apiUtils = api.useUtils();

  const handleCommissionChange = (
    value: string,
    setter: (value: string) => void,
  ) => {
    // Remove todos os caracteres que não são números ou ponto decimal
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Garante que só há um ponto decimal
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      const formattedValue = parts[0] + "." + parts.slice(1).join("");
      setter(formattedValue);
    } else {
      setter(numericValue);
    }
  };

  // Mutations
  const deleteMutation = api.employee.deleteEmployeeService.useMutation({
    onSuccess: () => {
      toast.success("Serviço desvinculado");
      void apiUtils.employee.getEmployeeById.invalidate();
    },
  });

  const createMutation = api.employee.addServiceToEmployee.useMutation({
    onSuccess: () => {
      toast.success("Serviço vinculado");
      setSelectedService("");
      setNewCommission("");
      void apiUtils.employee.getEmployeeById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = api.employee.updateEmployeeCommission.useMutation({
    onSuccess: () => {
      toast.success("Comissão atualizada");
      setEditingService(null);
      void apiUtils.employee.getEmployeeById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddService = () => {
    if (!selectedService) return toast.error("Selecione um serviço");

    createMutation.mutate({
      employeeId,
      serviceId: selectedService,
      commission: newCommission || "0.00",
    });
  };

  const handleUpdateCommission = () => {
    if (!editingService || !editCommission) return;

    updateMutation.mutate({
      employeeId,
      serviceId: editingService,
      commission: editCommission,
    });
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Serviços</CardTitle>
        <CardDescription>Gerenciar serviços e comissões</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label>Serviço</label>
            <Select
              value={selectedService}
              onValueChange={setSelectedService}
              disabled={createMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label>Comissão (%)</label>
            <Input
              placeholder="Opcional"
              value={newCommission}
              onChange={(e) =>
                handleCommissionChange(e.target.value, setNewCommission)
              }
              disabled={createMutation.isPending}
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleAddService}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Adicionar
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeServices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-6 text-center text-muted-foreground"
                  >
                    Nenhum serviço atribuído
                  </TableCell>
                </TableRow>
              ) : (
                employeeServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>
                      {Number(service.commission).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary"
                          onClick={() => {
                            setEditingService(service.id);
                            setEditCommission(service.commission);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-pencil"
                          >
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmar exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Remover este serviço do funcionário?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteMutation.mutate({
                                    serviceId: service.id,
                                    employeeId,
                                  })
                                }
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {deleteMutation.isPending ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  "Confirmar"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edição de Comissão */}
      <AlertDialog
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Editar Comissão</AlertDialogTitle>
            <AlertDialogDescription>
              Digite a nova porcentagem de comissão
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={editCommission}
              onChange={(e) =>
                handleCommissionChange(e.target.value, setEditCommission)
              }
              placeholder="Ex: 25.50"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateCommission}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Salvar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
