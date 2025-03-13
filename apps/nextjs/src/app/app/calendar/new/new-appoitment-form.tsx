"use client";

import type { z } from "zod";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Client, Employee, Service } from "@acme/db/schema";
import { createAppointmentSchema } from "@acme/validators";

import DataPickerWithHour from "@/components/data-picker-with-hour";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";

type Inputs = z.infer<typeof createAppointmentSchema>;

interface NewAppoitmentFormProps {
  clients: Client[];
  services: Service[];
  employees: Employee[];
}

export function NewAppoitmentForm({
  clients,
  employees,
  services,
}: NewAppoitmentFormProps) {
  // react-hook-form
  const form = useForm<Inputs>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      date: new Date(),
      status: "",
      checkIn: false,
      serviceId: "",
      employeeId: "",
      clientId: "",
    },
  });

  const apiUtils = api.useUtils();

  const createMutation = api.appointment.create.useMutation({
    onSuccess: () => {
      toast.success("Agendamento criado.");
      void apiUtils.appointment.all.invalidate();
      form.reset();
    },
  });

  async function onSubmit(inputs: Inputs) {
    await createMutation.mutateAsync(inputs);
  }

  const handleDateTimeChange = (timestamp: number) => {
    form.setValue("date", new Date(timestamp));
  };

  const day = form.watch("date").getDay();

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Novo agendamento</CardTitle>
        <CardDescription>Adicione um novo agendamento</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DataPickerWithHour
              onDateTimeChange={handleDateTimeChange}
              day={day}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="agendado">
                        <Badge>Agendado</Badge>
                      </SelectItem>
                      <SelectItem value="confirmado">
                        <Badge variant="secondary">Confirmado</Badge>
                      </SelectItem>
                      <SelectItem value="cancelado">
                        <Badge variant="destructive">Cancelado</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem value={service.id}>
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
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funcionário</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o funcionário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem value={employee.id}>
                          {employee.name}
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
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="ml-auto w-fit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Criar
              <span className="sr-only">Criar agendamento</span>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
