"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { Category, Service } from "@acme/db/schema";
import { UpdateService, updateServiceSchema } from "@acme/validators";

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
import { api } from "@/trpc/react";

export function UpdateServiceButton({
  service,
  categories,
  children,
}: {
  categories: Category[];
  service: Service & {
    categories: {
      id: string | undefined;
      name: string | undefined;
    }[];
  };
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  // react-hook-form
  const form = useForm<UpdateService>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      name: service.name,
      price: service.price,
      duration: service.duration,
      categoryIds: service.categories.map((c) => c.id) ?? [],
    },
  });

  const apiUtils = api.useUtils();

  const updateMutation = api.service.updateService.useMutation({
    onSuccess: () => {
      toast.success("Serviço atualizado.");
      void apiUtils.service.listServices.invalidate();
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar o serviço.", {
        description: error.message,
      });
    },
  });

  async function onSubmit(inputs: UpdateService) {
    if (inputs.categoryIds?.length === 0) {
      return toast.error("Escolha ao menos uma categoria.");
    }

    await updateMutation.mutateAsync({
      id: service.id,
      ...inputs,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        form.reset();
        return setOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar serviço</DialogTitle>
          <DialogDescription>
            Atualize as informações do serviço
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do serviço</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorias</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={categories.map((category) => ({
                        label: category.name,
                        value: category.id,
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

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (minutos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Valor do serviço</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className="-me-px rounded-e-none ps-8 shadow-none"
                        placeholder="0.00"
                        type="text"
                      />
                      <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                        R$
                      </span>
                    </div>
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
