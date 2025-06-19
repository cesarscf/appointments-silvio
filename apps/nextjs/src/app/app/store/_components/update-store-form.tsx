"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { Establishment } from "@acme/db/schema";
import type { UpdateEstablishment } from "@acme/validators";
import { applyPhoneMask, slugify } from "@acme/utils";
import { updateEstablishmentSchema } from "@acme/validators";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

// Extended schema to include logo
const extendedSchema = updateEstablishmentSchema.extend({
  logo: z.string().optional(),
});

// Extended type
type ExtendedUpdateEstablishment = UpdateEstablishment & {
  logo?: string;
  banner?: string;
};

export function UpdateStoreForm({ store }: { store: Establishment }) {
  const [logoPreview, setLogoPreview] = React.useState<string | null>(
    store.logo || null,
  );
  const [bannerPreview, setBannerPreview] = React.useState<string | null>(
    store.banner || null,
  );

  // react-hook-form
  const form = useForm<ExtendedUpdateEstablishment>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      name: store.name,
      slug: store.slug,
      about: store.about ?? "",
      logo: store.logo ?? "",
      banner: store.banner ?? "",
      phone: store.phone ?? "",
      activeCustomers: store.activeCustomers ?? "",
      experienceTime: store.experienceTime ?? "",
      servicesPerformed: store.servicesPerformed ?? "",
    },
  });

  const apiUtils = api.useUtils();

  const updateMutation = api.establishment.updateEstablishment.useMutation({
    onSuccess: () => {
      toast.success("Mudanças salvas.");
      void apiUtils.establishment.getEstablishmentById.invalidate();
    },
  });

  async function onSubmit(inputs: ExtendedUpdateEstablishment) {
    await updateMutation.mutateAsync(inputs);
  }

  const slugState = form.watch("slug");

  React.useEffect(() => {
    form.setValue("slug", slugify(slugState ?? ""));
  }, [slugState]);

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
      setLogoPreview(base64);
      form.setValue("logo", base64);
    } catch (error) {
      console.error("Erro ao converter imagem:", error);
      toast.error("Erro ao processar a imagem");
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 1024 * 1024) {
        toast.error("A imagem deve ter menos de 1MB");
        return;
      }

      const base64 = await convertToBase64(file);
      setBannerPreview(base64);
      form.setValue("banner", base64);
    } catch (error) {
      console.error("Erro ao converter imagem:", error);
      toast.error("Erro ao processar a imagem");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, "");
    const formattedPhone = applyPhoneMask(phone);
    form.setValue("phone", formattedPhone);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Loja</CardTitle>
            <CardDescription>
              Atualize o nome e o link da sua loja
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da loja</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <div className="flex rounded-md">
                      <span className="inline-flex items-center rounded-s-md border border-input bg-background px-3 text-sm text-muted-foreground">
                        agendar.tec.br/
                      </span>
                      <Input
                        className="-ms-px rounded-s-none shadow-none"
                        placeholder="meu-slug"
                        type="text"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Telefone *</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="(00) 00000-0000"
                        {...field}
                        onChange={handlePhoneChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="servicesPerformed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serviços feitos</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Ex: 150 serviços"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activeCustomers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuários ativos</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Ex: 80 clientes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de experiência</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Ex: 5 anos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo da loja</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-md border border-dashed">
                          {logoPreview ? (
                            <img
                              src={logoPreview || "/placeholder.svg"}
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
                          {logoPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLogoPreview(null);
                                form.setValue("logo", "");
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
              name="banner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner da loja</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-md border border-dashed">
                          {bannerPreview ? (
                            <img
                              src={bannerPreview || "/placeholder.svg"}
                              alt="Banner preview"
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
                            id="banner-upload"
                            className="hidden"
                            onChange={handleBannerUpload}
                          />
                          <label
                            htmlFor="banner-upload"
                            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Enviar banner
                          </label>
                          {bannerPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setBannerPreview(null);
                                form.setValue("banner", "");
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
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobre nós</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t p-4">
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
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
