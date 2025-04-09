"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Upload } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    service.image || null,
  );
  const [open, setOpen] = React.useState(false);

  // react-hook-form
  const form = useForm<UpdateService>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      name: service.name,
      price: service.price.replace(".", ","),
      duration: service.duration,
      active: service.active,
      categoryIds: service.categories.map((c) => c.id) ?? [],
    },
  });

  const apiUtils = api.useUtils();

  // Function to convert image to base64
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
      console.error("Erro ao converter imagem:", error);
      toast.error("Erro ao processar a imagem");
    }
  };

  const updateMutation = api.service.updateService.useMutation({
    onSuccess: () => {
      toast.success("Serviço atualizado.");
      void apiUtils.service.listServices.invalidate();
      void apiUtils.establishment.getOnboardingCheck.invalidate();
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
                              alt="Logo preview"
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
                            id="logo-upload"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                          <label
                            htmlFor="logo-upload"
                            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Enviar logo
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
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (minutos)</FormLabel>
                  <FormControl>
                    <Input
                      type="numeric"
                      inputMode="decimal"
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
                        placeholder="0,00"
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

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ativar/Desativar serviço</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
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
