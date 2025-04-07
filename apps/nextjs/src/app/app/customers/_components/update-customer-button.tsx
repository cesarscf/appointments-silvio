"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { Customer } from "@acme/db/schema";
import { clearNumber } from "@acme/utils";
import { UpdateCustomer, updateCustomerSchema } from "@acme/validators";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateInput } from "@/components/ui/date-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { applyCpfMask, applyPhoneMask } from "@/lib/utils";
import { api } from "@/trpc/react";

export function UpdateCustomerButton({
  customer,
  children,
}: {
  customer: Customer;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  // react-hook-form
  const form = useForm<UpdateCustomer>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      id: customer.id,
      name: customer.name,
      phoneNumber: customer.phoneNumber ?? "",
      birthDate: new Date(customer.birthDate),
      cpf: customer.cpf ?? "",
      email: customer.email ?? "",
      address: customer.address ?? "",
    },
  });

  const apiUtils = api.useUtils();

  const updateMutation = api.customer.updateCustomer.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado.");
      void apiUtils.customer.listCustomers.invalidate();
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cliente.", {
        description: error.message,
      });
    },
  });

  async function onSubmit(inputs: UpdateCustomer) {
    await updateMutation.mutateAsync({
      name: inputs.name,
      birthDate: inputs.birthDate,
      address: inputs.address,
      phoneNumber: inputs.phoneNumber ?? "",
      cpf: inputs.cpf ?? "",
      email: inputs.email,
      id: customer.id,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        form.reset();
        setOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Atualizar cliente</DialogTitle>
          <DialogDescription>Atualize o cliente</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-row items-center gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Digite o nome completo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="(00) 00000-0000"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(applyPhoneMask(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de nascimento *</FormLabel>
                  <DateInput
                    locale={ptBR}
                    value={field.value!}
                    onChange={field.onChange}
                    placeholder="DD/MM/AAAA"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="exemplo@dominio.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="000.000.000-00"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(applyCpfMask(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o endereço completo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="ml-auto w-fit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Salvar
              <span className="sr-only">Salvar</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
