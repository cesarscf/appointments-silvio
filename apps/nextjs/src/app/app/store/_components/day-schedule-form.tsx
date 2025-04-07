"use client";

import type { UseFormReturn } from "react-hook-form";
import { PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DayScheduleFormProps {
  form: UseFormReturn<any>;
  dayIndex: number;
  dayName: string;
}

export function DayScheduleForm({
  form,
  dayIndex,
  dayName,
}: DayScheduleFormProps) {
  const dayData = form.watch(`hours.${dayIndex}`);

  const addInterval = () => {
    const currentIntervals =
      form.getValues(`hours.${dayIndex}.intervals`) || [];
    form.setValue(`hours.${dayIndex}.intervals`, [
      ...currentIntervals,
      { startTime: "12:00", endTime: "13:00" },
    ]);
  };

  const removeInterval = (intervalIndex: number) => {
    const currentIntervals =
      form.getValues(`hours.${dayIndex}.intervals`) || [];
    const updatedIntervals = currentIntervals.filter(
      (_: any, i: number) => i !== intervalIndex,
    );
    form.setValue(`hours.${dayIndex}.intervals`, updatedIntervals);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Horários de {dayName}</h3>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`hours.${dayIndex}.openingTime`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Abertura</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`hours.${dayIndex}.closingTime`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Fechamento</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Intervalos de Pausa</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addInterval}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Adicionar Pausa
          </Button>
        </div>

        {dayData?.intervals?.length > 0 ? (
          <div className="space-y-3">
            {dayData.intervals.map((interval: any, intervalIndex: number) => (
              <Card key={intervalIndex}>
                <CardContent className="p-4">
                  <div className="flex items-end gap-4">
                    <div className="grid flex-1 grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`hours.${dayIndex}.intervals.${intervalIndex}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de Início</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`hours.${dayIndex}.intervals.${intervalIndex}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de Término</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInterval(intervalIndex)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma pausa adicionada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
