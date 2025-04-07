"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Service } from "@acme/db/schema";
import { applyPhoneMask } from "@acme/utils";
import { CreateEmployee, createEmployeeSchema } from "@acme/validators";

import { Button } from "@/components/ui/button";
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
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

export function CreateEmployeeButton({ services }: { services: Service[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  // react-hook-form
  const form = useForm<CreateEmployee>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      serviceIds: [],
    },
  });

  const apiUtils = api.useUtils();

  const createMutation = api.employee.createEmployee.useMutation({
    onSuccess: (data) => {
      toast.success("Funcionário criado.");
      void apiUtils.employee.listEmployees.invalidate();
      void apiUtils.establishment.getOnboardingCheck.invalidate();
      setOpen(false);
      form.reset();
      router.push(`/app/employees/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  async function onSubmit(inputs: CreateEmployee) {
    if (inputs.serviceIds.length < 1) {
      return toast.error("Adicione ao menos um serviço a este funcionário.");
    }
    await createMutation.mutateAsync(inputs);
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, "");
    const formattedPhone = applyPhoneMask(phone);
    form.setValue("phone", formattedPhone);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        form.reset();
        return setOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild className="ml-auto mr-4">
        <Button>Novo Funcionário</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo funcionário</DialogTitle>
          <DialogDescription>Adicione um novo funcionário</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      onChange={handlePhoneChange}
                    />
                  </FormControl>
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
                    <Input type="text" {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {services.length === 0 ? null : (
              <FormField
                control={form.control}
                name="serviceIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Adicione os serviços realizado por esse funcionário
                    </FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={services.map((service) => ({
                          label: service.name,
                          value: service.id,
                        }))}
                        // @ts-ignore
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione as categorias"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
              <span className="sr-only">Criar</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
