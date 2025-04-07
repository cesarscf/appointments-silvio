"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { CreateCategoryButton } from "./create-category-button";
import { CreateServiceButton } from "./create-service-button";
import { ServiceCard } from "./service-card";
import { UpdateCategoryButton } from "./update-category-button";

export function Services() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [services] = api.service.listServices.useSuspenseQuery();
  const [categories] = api.category.listCategories.useSuspenseQuery();

  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "service",
  });

  const tabs = [
    {
      id: "service",
      title: "Serviços",
    },
    {
      id: "category",
      title: "Categorias",
    },
  ];

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const apiUtils = api.useUtils();
  const deleteServiceMutation = api.service.deleteService.useMutation({
    onSuccess: () => {
      toast.success("Serviço excluído.");
      void apiUtils.service.listServices.invalidate();
    },
  });

  const deleteCategoryMutation = api.category.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Categoria excluída.");
      void apiUtils.category.listCategories.invalidate();
    },
  });

  const servicesEmpty = services.length < 1;
  const categoriesEmpty = categories.length < 1;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Serviços</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {tab !== "category" ? (
          <CreateServiceButton categories={categories} />
        ) : (
          <CreateCategoryButton />
        )}
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full px-8 pb-8">
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

        <TabsContent value="service">
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Filtrar por nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[300px]"
            />
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                categories={categories}
                deleteIsPending={deleteServiceMutation.isPending}
                onDelete={(id) => {
                  deleteServiceMutation.mutate({
                    id: id,
                  });
                }}
              />
            ))}
          </div>
          {servicesEmpty ? "Nenhum serviço cadastrado" : null}
        </TabsContent>

        <TabsContent value="category">
          <div className="mt-8 max-w-2xl space-y-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
                  <h2>{category.name}</h2>
                  <div className="flex gap-2">
                    <UpdateCategoryButton category={category}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </UpdateCategoryButton>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        deleteCategoryMutation.mutate({
                          id: category.id,
                        });
                      }}
                      disabled={deleteCategoryMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {categoriesEmpty ? "Nenhuma categoria cadastrada" : null}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
