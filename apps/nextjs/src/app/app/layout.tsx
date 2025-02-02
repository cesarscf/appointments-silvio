import { redirect } from "next/navigation";

import { getSession } from "@acme/auth";

import { AppSidebar } from "@/app/app/_components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { api, HydrateClient } from "@/trpc/server";

export default async function Layout({ children }: React.PropsWithChildren) {
  const session = await getSession();

  if (!session?.user) {
    return redirect("/login");
  }

  void api.store.getByUserId.prefetch();

  return (
    <SidebarProvider>
      <HydrateClient>
        <AppSidebar />
      </HydrateClient>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
