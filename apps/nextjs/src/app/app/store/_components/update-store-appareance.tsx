import React from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function UpdateStoreAppaerance({
  currentTheme,
}: {
  currentTheme: string;
}) {
  const themes = [
    {
      label: "Vermelho",
      value: "red",
    },
    {
      label: "Azul",
      value: "blue",
    },
    {
      label: "Verde",
      value: "green",
    },
  ];
  const themeIdx = themes.findIndex((it) => it.value === currentTheme);

  const [selectedTheme, setTheme] = React.useState(themes[themeIdx]!);

  const apiUtils = api.useUtils();

  const updateMutation = api.store.update.useMutation({
    onSuccess: () => {
      toast.success("Tema atualizado.");
      void apiUtils.store.getByUserId.invalidate();
    },
  });

  async function onSave() {
    await updateMutation.mutateAsync({
      theme: selectedTheme.value,
    });
  }

  return (
    <Card className="mt-8 max-w-xl">
      <CardHeader>
        <CardTitle>Tema</CardTitle>
        <CardDescription>Custome o tema da sua loja.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-1 flex-col space-y-4 md:space-y-6">
          <div className="space-y-1.5">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {themes.map((theme) => {
                const active = theme.value === selectedTheme.value;
                return (
                  <Button
                    variant={"outline"}
                    size="sm"
                    key={theme.value}
                    onClick={() => {
                      setTheme({
                        ...theme,
                      });
                    }}
                    className={cn(
                      "justify-start",
                      active && "border-2 border-primary",
                    )}
                    style={
                      {
                        "--theme-primary": `${theme.value}`,
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className={cn(
                        "mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-[--theme-primary]",
                      )}
                    >
                      {active && <Check className="h-4 w-4 text-white" />}
                    </span>
                    {theme.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          disabled={updateMutation.isPending}
          onClick={onSave}
          className="ml-auto"
        >
          {updateMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Salvar"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
