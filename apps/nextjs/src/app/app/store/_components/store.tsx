"use client";

import { useQueryState } from "nuqs";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { UpdateStoreAppaerance } from "./update-store-appareance";
import { UpdateStoreForm } from "./update-store-form";

export function Store() {
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "store",
  });

  const tabs = [
    {
      id: "store",
      title: "Geral",
    },
    {
      id: "appareance",
      title: "Aparência",
    },
  ];

  const [store] = api.store.getByUserId.useSuspenseQuery();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Loja</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full px-8">
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

        <TabsContent value="store">
          <div className="mt-8 max-w-2xl">
            <UpdateStoreForm store={store} />
          </div>
        </TabsContent>

        <TabsContent value="appareance">
          <UpdateStoreAppaerance currentTheme={store.theme} />
        </TabsContent>
      </Tabs>
    </>
  );
}
