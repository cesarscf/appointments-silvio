"use client";

import type { z } from "zod";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Store } from "@acme/db/schema";
import { updateStoreSchema } from "@acme/validators";

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
import { api } from "@/trpc/react";

type Inputs = z.infer<typeof updateStoreSchema>;

export function UpdateStoreForm({ store }: { store: Store }) {
  // react-hook-form
  const form = useForm<Inputs>({
    resolver: zodResolver(updateStoreSchema),
    defaultValues: {
      name: store.name,
      slug: store.slug,
    },
  });

  const apiUtils = api.useUtils();

  const updateMutation = api.store.update.useMutation({
    onSuccess: () => {
      toast.success("Mudanças salvas.");
      void apiUtils.store.getByUserId.invalidate();
    },
  });

  async function onSubmit(inputs: Inputs) {
    await updateMutation.mutateAsync({
      slug: inputs.slug,
      name: inputs.name,
    });
  }

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

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
