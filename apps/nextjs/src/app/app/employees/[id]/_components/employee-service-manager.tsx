"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

const schema = z.object({
  serviceId: z.string(),
  commission: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

export function EmployeeServiceManager({
  employeeId,
  services,
  employeeServices,
}: EmployeeServiceManagerProps) {
  const form = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceId: "",
      commission: "",
    },
  });

  const apiUtils = api.useUtils();
  const deleteMutation = api.employee.deleteEmployeeService.useMutation({
    onSuccess: () => {
      toast.success("Serviço desvinculado do funcionário");
      form.reset();
      void apiUtils.employee.getEmployeeById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const createMutation = api.employee.addServiceToEmployee.useMutation({
    onSuccess: () => {
      toast.success("Serviço vinculado ao funcionário");
      void apiUtils.employee.getEmployeeById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(data: Inputs) {
    if (data.serviceId === "") {
      return toast.error("Escolha um serviço");
    }

    createMutation.mutate({
      employeeId,
      serviceId: data.serviceId,
      commission: data.commission,
    });
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Serviços</CardTitle>
        <CardDescription>Gerenciar serviços e comissões</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviço</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comissão (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end">
                <Button type="submit">Adicionar</Button>
              </div>
            </div>
          </form>
        </Form>

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
                    Nenhum serviço atribuído ainda
                  </TableCell>
                </TableRow>
              ) : (
                employeeServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.commission} %</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso removerá o serviço deste funcionário.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteMutation.mutate({
                                  serviceId: service.id,
                                  employeeId,
                                });
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
