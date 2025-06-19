"use client";

import * as React from "react";
import Image from "next/image";
import { useSelectedLayoutSegments } from "next/navigation";
import {
  Calendar,
  Command,
  ContactRound,
  HammerIcon,
  Handshake,
  LayoutDashboard,
  Package,
  Store,
  Users,
} from "lucide-react";

import { NavMain } from "@/app/app/_components/nav-main";
import { NavUser } from "@/app/app/_components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { OnboardingChecklist } from "./onboarding-checklist";
import { authClient } from "@acme/auth/client";

export function AppSidebar({
  isAdmin,
  ...props
}: React.ComponentProps<typeof Sidebar> & { isAdmin: boolean }) {
  const segments = useSelectedLayoutSegments();

  const [store] = api.establishment.getEstablishmentById.useSuspenseQuery();
  const [onboardingCheck] =
    api.establishment.getOnboardingCheck.useSuspenseQuery();

  const isOnboardingComplete =
    onboardingCheck.serviceCreated &&
    onboardingCheck.categoryCreated &&
    onboardingCheck.employeeCreated;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href={`/${store.slug}`} target="_blank" rel="noreferrer">
                {store.logo ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-md">
                    <Image
                      src={store.logo}
                      alt={`${store.name} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                )}

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{store.name}</span>
                  <span className="truncate text-xs">{store.slug}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {!isOnboardingComplete && (
          <>
            <OnboardingChecklist onboardingCheck={onboardingCheck} />
            <SidebarSeparator />
          </>
        )}
        <NavMain
          items={[
            {
              title: "Dashboard",
              url: "/app",
              icon: LayoutDashboard,
              isActive: segments.length === 0,
            },
            {
              title: "Agenda",
              url: "/app/calendar",
              icon: Calendar,
              isActive: segments.includes("calendar"),
            },
            {
              title: "Serviços",
              url: "/app/services",
              icon: HammerIcon,
              isActive: segments.includes("services"),
            },
            {
              title: "Profissionais",
              url: "/app/employees",
              icon: ContactRound,
              isActive: segments.includes("employees"),
            },
            {
              title: "Clientes",
              url: "/app/customers",
              icon: Users,
              isActive: segments.includes("customers"),
            },
            {
              title: "Fidelidade",
              url: "/app/loyalties",
              icon: Handshake,
              isActive: segments.includes("loyalties"),
            },
            {
              title: "Pacotes",
              url: "/app/packages",
              icon: Package,
              isActive: segments.includes("packages"),
            },
            {
              title: "Loja",
              url: "/app/store",
              icon: Store,
              isActive: segments.includes("store"),
            },
          ]}
        />

        {isAdmin && (
          <NavMain
            label={"Admin"}
            items={[
              {
                title: "Dashboard",
                url: "/app/admin/dashboard",
                icon: LayoutDashboard,
                isActive:
                  segments.includes("admin") && segments.includes("dashboard"),
              },
              {
                title: "Clientes",
                url: "/app/admin/customers",
                icon: Users,
                isActive:
                  segments.includes("admin") && segments.includes("customers"),
              },
            ]}
          />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
