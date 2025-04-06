"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { DayScheduleForm } from "./day-schedule-form";

// Define o schema para intervalos
const intervalSchema = z.object({
  id: z.string().optional(),
  openingHourId: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
});

// Define o schema para horários de funcionamento
const openingHourSchema = z.object({
  id: z.string().optional(),
  establishmentId: z.string().optional(),
  dayOfWeek: z.number().min(0).max(6),
  openingTime: z.string(),
  closingTime: z.string(),
  intervals: z.array(intervalSchema),
});

// Define o schema para o formulário
const formSchema = z.object({
  businessHours: z.array(openingHourSchema),
});

// Tipo para os valores do formulário
type FormValues = z.infer<typeof formSchema>;

// Dias da semana
const DIAS_DA_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export default function BusinessHoursForm({
  openingHours,
}: {
  openingHours: {
    id: string;
    establishmentId: string;
    dayOfWeek: number;
    openingTime: string;
    closingTime: string;
    intervals: {
      id: string;
      openingHourId: string;
      startTime: string;
      endTime: string;
    }[];
  }[];
}) {
  // Inicializa o formulário com o schema e valores padrão
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessHours: openingHours,
    },
  });

  const apiUtils = api.useUtils();
  const updateMutation = api.openingHours.update.useMutation({
    onSuccess: () => {
      toast.success("Horário de funcionamento atualizado.");
      void apiUtils.establishment.getEstablishmentById.invalidate();
    },
  });

  async function onSubmit(data: FormValues) {
    await updateMutation.mutateAsync(data.businessHours);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Horários de Funcionamento</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="mb-4 grid grid-cols-7">
                {DIAS_DA_SEMANA.map((dia, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    {dia.substring(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {DIAS_DA_SEMANA.map((dia, index) => (
                <TabsContent key={index} value={index.toString()}>
                  <DayScheduleForm form={form} dayIndex={index} dayName={dia} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Salvar Horários"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
