"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Category } from "@acme/db/schema";
import { CreateService, createServiceSchema } from "@acme/validators";

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

export function CreateServiceButton({
  categories,
}: {
  categories: Category[];
}) {
  const [open, setOpen] = React.useState(false);

  // react-hook-form
  const form = useForm<CreateService>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      duration: 30,
      price: "",
      categoryIds: [],
    },
  });

  const apiUtils = api.useUtils();

  const createMutation = api.service.createService.useMutation({
    onSuccess: () => {
      toast.success("Serviço criado com sucesso.");
      void apiUtils.service.listServices.invalidate();
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Erro ao criar o serviço.", {
        description: error.message,
      });
    },
  });

  async function onSubmit(inputs: CreateService) {
    await createMutation.mutateAsync(inputs);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        form.reset();
        return setOpen((prev) => !prev);
      }}
    >
      <DialogTrigger asChild className="ml-auto mr-4">
        <Button>Novo Serviço</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo serviço</DialogTitle>
          <DialogDescription>Adicione um novo serviço</DialogDescription>
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

            {categories.length === 0 ? null : (
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
            )}

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
