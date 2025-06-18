"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Upload } from "lucide-react";
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
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

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
      image: "",
    },
  });
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 1024 * 1024) {
        toast.error("A imagem deve ter menos de 1MB");
        return;
      }

      const base64 = await convertToBase64(file);
      setImagePreview(base64);
      form.setValue("image", base64);
    } catch (error) {
      toast.error("Erro ao processar a imagem");
    }
  };

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
      form.reset();
      void apiUtils.package.getAll.invalidate();
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
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-md border border-dashed">
                          {imagePreview ? (
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Imagem preview"
                              className="h-full w-full rounded-md object-contain p-2"
                            />
                          ) : (
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            id="image-upload"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                          <label
                            htmlFor="image-upload"
                            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Enviar imagem
                          </label>
                          {imagePreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setImagePreview(null);
                                form.setValue("image", "");
                              }}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Envie uma imagem de até 1MB. Formatos recomendados: PNG,
                        JPG, SVG.
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
