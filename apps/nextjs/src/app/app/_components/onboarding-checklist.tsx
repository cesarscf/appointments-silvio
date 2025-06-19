"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ContactRound,
  HammerIcon,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OnboardingChecklistProps {
  onboardingCheck: {
    serviceCreated: boolean;
    categoryCreated: boolean;
    employeeCreated: boolean;
  };
}

export function OnboardingChecklist({
  onboardingCheck,
}: OnboardingChecklistProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  const completedSteps = Object.values(onboardingCheck).filter(Boolean).length;
  const totalSteps = Object.values(onboardingCheck).length;
  const progress = (completedSteps / totalSteps) * 100;

  const isComplete = completedSteps === totalSteps;

  return (
    <TooltipProvider>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="group/collapsible"
      >
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-500" />
                <span>Configuração inicial</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {completedSteps}/{totalSteps}
                </span>
                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </div>
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <div className="mb-2 px-2">
                <Progress value={progress} className="h-1.5" />
              </div>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/app/services/categories">
                      {onboardingCheck.categoryCreated ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <CircleAlert className="h-4 w-4 text-amber-500" />
                      )}
                      <span>Criar categorias</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/app/services">
                      {onboardingCheck.serviceCreated ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <CircleAlert className="h-4 w-4 text-amber-500" />
                      )}
                      <span>Criar serviços</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/app/employees">
                      {onboardingCheck.employeeCreated ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <CircleAlert className="h-4 w-4 text-amber-500" />
                      )}
                      <span>Adicionar Profissionais</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              {!isComplete && (
                <div className="mt-2 px-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link
                      href={
                        !onboardingCheck.categoryCreated
                          ? "/app/services?tab=category"
                          : !onboardingCheck.serviceCreated
                            ? "/app/services"
                            : "/app/employees"
                      }
                    >
                      Completar configuração
                    </Link>
                  </Button>
                </div>
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </TooltipProvider>
  );
}
