"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { EmployeeServiceManager } from "./employee-service-manager";
import { EmployeeUnavailabilityForm } from "./update-unavailabilities-form";

// Define the form schema with Zod
const formSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().nullable(),
  address: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function EmployeeDetails() {
  const { id } = useParams();
  const [employee] = api.employee.getEmployeeById.useSuspenseQuery({
    id: id as string,
  });
  const [services] = api.service.listServices.useSuspenseQuery();
  const utils = api.useUtils();

  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "geral",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateEmployee = api.employee.updateEmployee.useMutation({
    onSuccess: () => {
      toast.success("Funcionário atualizado");
      utils.employee.getEmployeeById.invalidate({ id: id as string });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Initialize the form with employee data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      phone: employee.phone,
      address: employee.address,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await updateEmployee.mutateAsync({
        id: employee.id,
        address: data.address ?? "",
        email: data.email ?? "",
        name: data.name ?? "",
        phone: data.phone ?? "",
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
                  {/* 
                  <AvatarImage
                    src={employee.photo ?? undefined}
                    alt={employee.name}
                  /> 
                */}
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
                              <Input {...field} value={field.value || ""} />
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

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Salvar Alterações"
                      )}
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
    </>
  );
}
