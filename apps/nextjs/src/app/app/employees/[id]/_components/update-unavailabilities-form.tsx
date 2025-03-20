"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import type { Unavailability } from "@acme/db/schema";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";

const schema = z.object({
  employeeId: z.string(),
  unavailabilitiesItens: z.array(
    z.object({
      dayOfWeek: z.number(),
      startTime: z.string(),
      endTime: z.string(),
    }),
  ),
});

type Inputs = z.infer<typeof schema>;

const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

interface EmployeeUnavailabilityFormProps {
  employeeId: string;
  unavailabilitiesItens: Unavailability[];
}

export function EmployeeUnavailabilityForm({
  unavailabilitiesItens,
  employeeId,
}: EmployeeUnavailabilityFormProps) {
  const [_localUnavailabilities, setLocalUnavailabilities] = useState(
    unavailabilitiesItens,
  );

  const form = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeId,
      unavailabilitiesItens: unavailabilitiesItens.map((it) => ({
        dayOfWeek: it.dayOfWeek ?? 0,
        startTime: it.startTime ?? "09:00",
        endTime: it.endTime ?? "17:00",
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "unavailabilitiesItens",
  });

  const apiUtils = api.useUtils();
  const createMutation =
    api.employee.updateEmployeeUnavailabilities.useMutation({
      onSuccess: async () => {
        toast.success("Indisponibilidades atualizadas com sucesso.");
        await apiUtils.employee.getEmployeeById.invalidate({ id: employeeId });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  async function onSubmit(inputs: Inputs) {
    await createMutation.mutateAsync({
      employeeId: inputs.employeeId,
      unavailabilitiesItens: inputs.unavailabilitiesItens,
    });
  }

  useEffect(() => {
    setLocalUnavailabilities(unavailabilitiesItens);

    form.reset({
      employeeId: employeeId,
      unavailabilitiesItens: unavailabilitiesItens.map((it) => ({
        dayOfWeek: it.dayOfWeek ?? 0,
        startTime: it.startTime ?? "09:00",
        endTime: it.endTime ?? "17:00",
      })),
    });
  }, [unavailabilitiesItens, employeeId, form]);

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Indisponibilidade</CardTitle>
        <CardDescription>
          Defina os dias e horários em que o funcionário não estará disponível
          para trabalhar.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Indisponibilidades</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      dayOfWeek: 0,
                      startTime: "09:00",
                      endTime: "17:00",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-md border bg-muted/20 p-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`unavailabilitiesItens.${index}.dayOfWeek`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dia da Semana</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o dia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {weekDays.map((day) => (
                                <SelectItem
                                  key={day.value}
                                  value={day.value.toString()}
                                >
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`unavailabilitiesItens.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário Inicial</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`unavailabilitiesItens.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário Final</FormLabel>
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
                    size="sm"
                    className="mt-2 text-destructive"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              ))}
              {form.formState.errors.unavailabilitiesItens?.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.unavailabilitiesItens.root.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? "Salvando..."
                : "Salvar Indisponibilidades"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
