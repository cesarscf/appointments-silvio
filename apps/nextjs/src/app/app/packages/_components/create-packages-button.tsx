"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { servicePackageSchema } from "@acme/validators";

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
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

type ServicePackageFormValues = z.infer<typeof servicePackageSchema>;

interface ServicePackageModalProps {
  services: { id: string; name: string }[];
  onSuccess?: () => void;
}

export function CreateServicePackageButton({
  services,
  onSuccess,
}: ServicePackageModalProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ServicePackageFormValues>({
    resolver: zodResolver(servicePackageSchema),
    defaultValues: {
      name: "",
      serviceId: "",
      quantity: 1,
      servicePrice: "",
      commission: 0,
      packagePrice: 0,
      active: true,
      description: "",
    },
  });

  // Calculate package price when quantity or service price changes
  useEffect(() => {
    const quantity = form.watch("quantity");
    const servicePrice = form.watch("servicePrice");

    if (quantity && servicePrice) {
      const numberValue = Number(servicePrice.replace(",", "."));
      if (!isNaN(numberValue)) {
        const calculatedPrice = quantity * numberValue;
        form.setValue("packagePrice", parseFloat(calculatedPrice.toFixed(2)));
      }
    }
  }, [form.watch("quantity"), form.watch("servicePrice"), form]);

  const handleServicePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove tudo que não é número, vírgula ou ponto
    value = value.replace(/[^0-9,.]/g, "");

    // Substitui múltiplos pontos/vírgulas por apenas um
    value = value.replace(/([,.])[,.]+/g, "$1");

    // Verifica se é um número válido
    const numberValue = value.replace(",", ".");
    if (
      numberValue === "" ||
      (!isNaN(Number(numberValue)) && numberValue.split(".").length <= 2)
    ) {
      form.setValue("servicePrice", value);
    }
  };

  const apiUtils = api.useUtils();

  const createMutation = api.package.create.useMutation({
    onSuccess: () => {
      toast.success("Pacote de serviço criado com sucesso");
      void apiUtils.package.getAll.invalidate();
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createServicePackage = async (data: ServicePackageFormValues) => {
    // Format data before submission
    const submissionData = {
      ...data,
      servicePrice: data.servicePrice.replace(",", "."),
    };

    createMutation.mutate(submissionData);
  };
  async function onSubmit(data: ServicePackageFormValues) {
    await createServicePackage(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} variant="default" className="ml-auto mr-4">
          Criar Pacote de Serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Pacote de Serviço</DialogTitle>
          <DialogDescription>
            Crie um pacote de serviço para oferecer aos seus clientes.
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
                  <FormControl>
                    <Input placeholder="Nome do pacote" {...field} />
                  </FormControl>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="servicePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Serviço (R$)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="-me-px rounded-e-none ps-8 shadow-none"
                          placeholder="0,00"
                          value={field.value}
                          onChange={handleServicePriceChange}
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
            </div>

            <FormField
              control={form.control}
              name="packagePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço do Pacote (R$)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        readOnly
                        value={field.value.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        className="-me-px rounded-e-none ps-8 shadow-none"
                        placeholder="0.00"
                        type="text"
                      />
                      <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                        R$
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Calculado automaticamente (Valor do Serviço x Quantidade)
                  </FormDescription>
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
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição do pacote de serviço"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button disabled={createMutation.isPending} type="submit">
                {createMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Criar Pacote
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
