"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { daysOfWeekPtBr } from "@acme/utils";
import { UpdateOpeningHours, updateOpeningHoursSchema } from "@acme/validators";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { DayScheduleForm } from "./day-schedule-form";

const formSchema = z.object({
  hours: updateOpeningHoursSchema,
});

interface OpeningHoursFormProps {
  data: UpdateOpeningHours;
}

export default function OpeningHoursForm({ data }: OpeningHoursFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hours: data,
    },
  });

  const apiUtils = api.useUtils();
  const updateMutation = api.openingHours.update.useMutation({
    onSuccess: () => {
      toast.success("Horário de funcionamento atualizado.");
      void apiUtils.establishment.getEstablishmentById.invalidate();
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await updateMutation.mutateAsync(data.hours);
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
                {daysOfWeekPtBr.map((dia, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    {dia.substring(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {daysOfWeekPtBr.map((dia, index) => (
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
