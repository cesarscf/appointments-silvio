"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { loyaltyProgramSchema } from "@acme/validators";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";

import { ReturnedLoyalty } from "./loyalty-card";

const schema = loyaltyProgramSchema.omit({ id: true });

type LoyaltyProgramFormValues = z.infer<typeof schema>;

interface UpdateLoyaltyProgramModalProps {
  services: { id: string; name: string }[];
  onSuccess?: () => void;
  loyalty: ReturnedLoyalty;
}

export function UpdateLoyaltyProgramModal({
  services,
  onSuccess,
  loyalty,
}: UpdateLoyaltyProgramModalProps) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<LoyaltyProgramFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pointsPerService: loyalty.pointsPerService,
      requiredPoints: loyalty.requiredPoints,
      bonusQuantity: loyalty.bonusQuantity,
      serviceId: loyalty.serviceId,
      bonusServiceId: loyalty.bonusServiceId,
      name: loyalty.name,
      active: loyalty.active,
    },
  });

  const apiUtils = api.useUtils();

  const updateLoyaltyProgram = api.loyalty.update.useMutation({
    onSuccess: () => {
      form.reset();
      toast.success("Programa de fidelidade criado");
      apiUtils.loyalty.getAll.invalidate();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(data: LoyaltyProgramFormValues) {
    updateLoyaltyProgram.mutate({
      ...data,
      id: loyalty.id,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} variant="outline" className="ml-auto mr-4">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Programa de Fidelidade</DialogTitle>
          <DialogDescription>
            Editar um programa de fidelidade para seus clientes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    type="text"
                    placeholder="Nome do programa"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço Principal</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço principal" />
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
              name="bonusServiceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço Bônus</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço bônus" />
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
              name="pointsPerService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontos por Serviço</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiredPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontos Necessários</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bonusQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de Bônus</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={updateLoyaltyProgram.isPending}>
                {updateLoyaltyProgram.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
