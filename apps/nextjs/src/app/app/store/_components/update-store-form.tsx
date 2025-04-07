"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Establishment } from "@acme/db/schema";
import { slugify } from "@acme/utils";
import {
  UpdateEstablishment,
  updateEstablishmentSchema,
} from "@acme/validators";

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

export function UpdateStoreForm({ store }: { store: Establishment }) {
  // react-hook-form
  const form = useForm<UpdateEstablishment>({
    resolver: zodResolver(updateEstablishmentSchema),
    defaultValues: {
      name: store.name,
      slug: store.slug,
      about: store.about ?? "",
    },
  });

  const apiUtils = api.useUtils();

  const updateMutation = api.establishment.updateEstablishment.useMutation({
    onSuccess: () => {
      toast.success("Mudanças salvas.");
      void apiUtils.establishment.getEstablishmentById.invalidate();
    },
  });

  async function onSubmit(inputs: UpdateEstablishment) {
    await updateMutation.mutateAsync(inputs);
  }

  const slugState = form.watch("slug");

  React.useEffect(() => {
    form.setValue("slug", slugify(slugState ?? ""));
  }, [slugState]);

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
