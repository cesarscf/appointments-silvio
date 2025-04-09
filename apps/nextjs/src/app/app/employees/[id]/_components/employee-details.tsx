"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { UpdateEmployee } from "@acme/validators";
import { applyPhoneMask } from "@acme/utils";
import { updateEmployeeSchema } from "@acme/validators";

import { DeleteConfirmationModal } from "@/components/confirm-delete-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { EmployeeServiceManager } from "./employee-service-manager";
import { EmployeeUnavailabilityForm } from "./update-unavailabilities-form";

export function EmployeeDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [employee] = api.employee.getEmployeeById.useSuspenseQuery({
    id: id as string,
  });

  console.log(employee);
  const [services] = api.service.listServices.useSuspenseQuery();
  const utils = api.useUtils();

  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "geral",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    employee.image ?? null,
  );

  const updateEmployee = api.employee.updateEmployee.useMutation({
    onSuccess: () => {
      toast.success("Funcionário atualizado");
      void utils.employee.getEmployeeById.invalidate({ id: id as string });
      void utils.establishment.getOnboardingCheck.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteEmployee = api.employee.deleteEmployee.useMutation({
    onSuccess: () => {
      toast.success("Funcionário excluído");
      void utils.employee.listEmployees.invalidate();
      void utils.establishment.getOnboardingCheck.invalidate();
      router.push("/app/employees");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Initialize the form with employee data
  const form = useForm<UpdateEmployee>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      email: employee.email ?? "",
      name: employee.name,
      phone: employee.phone ?? "",
      address: employee.address ?? "",
      active: employee.active,
      image: employee.image ?? "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: UpdateEmployee) => {
    console.log(data);

    setIsSubmitting(true);
    try {
      await updateEmployee.mutateAsync({
        id: employee.id,
        address: data.address ?? "",
        email: data.email ?? "",
        name: data.name ?? "",
        phone: data.phone ?? "",
        active: data.active,
        image: data.image ?? "",
      });
    } catch (error) {
      console.error("Failed to update employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    {
      id: "geral",
      title: "Geral",
    },
    {
      id: "services",
      title: "Serviços",
    },
    {
      id: "unavailabilities",
      title: "Indisponibilidades",
    },
  ];

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

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/app/employees">
                  Funcionários
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{employee.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="h-full w-full px-8 pb-8"
      >
        <TabsList className="h-auto rounded-none bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="geral">
          <div className="space-y-6">
            {/* Employee Card Display */}
            <Card className="mt-5 max-w-3xl">
              <CardHeader className="flex flex-col items-center gap-4 md:flex-row">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={employee.image ?? undefined}
                    alt={employee.name}
                  />

                  <AvatarFallback>
                    {employee.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{employee.name}</CardTitle>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {employee.services.map((s) => (
                      <Badge key={s.id}>{s.name}</Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Employee Edit Form */}
            <Card className="max-w-3xl">
              <CardHeader>
                <CardTitle>Editar Informações do Funcionário</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input
                                {...field}
                                value={field.value || ""}
                                type="email"
                              />
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
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => {
                                  field.onChange(
                                    applyPhoneMask(e.target.value),
                                  );
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
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ativar/Desativar</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
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
                          <FormLabel>Foto</FormLabel>
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
                                Envie uma imagem de até 1MB. Formatos
                                recomendados: PNG, JPG, SVG.
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Salvar Alterações"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant={"destructive"}
                      className="ml-2"
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      Excluir
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="mt-5">
            <EmployeeServiceManager
              employeeId={employee.id}
              services={services}
              employeeServices={employee.services}
            />
          </div>
        </TabsContent>

        <TabsContent value="unavailabilities">
          <div className="mt-5">
            <EmployeeUnavailabilityForm
              employeeId={employee.id}
              unavailabilitiesItens={employee.unavailabilities}
            />
          </div>
        </TabsContent>
      </Tabs>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deleteEmployee.mutate({
            id: employee.id,
          });
          setIsDeleteModalOpen(false);
        }}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir ${employee.name}? Essa ação é irreversível e todos os itens relacionados a este funcionário também serão excluídos.`}
      />
    </>
  );
}
