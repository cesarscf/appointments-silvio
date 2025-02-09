"use client";

import { useState } from "react";
import { toast } from "sonner";

import { StoreHour } from "@acme/db/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { translateWeekday } from "@/lib/utils";
import { api } from "@/trpc/react";

export default function UpdateStoreHours({
  storeHoursInitial,
}: {
  storeHoursInitial: StoreHour[];
}) {
  const [storeHours, setStoreHours] = useState<StoreHour[]>(storeHoursInitial);

  const handleInputChange = (
    index: number,
    field: keyof StoreHour,
    value: string,
  ) => {
    const updatedHours = [...storeHours];

    // @ts-ignore
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setStoreHours(updatedHours);
  };

  const handleCheckboxChange = (index: number) => {
    const updatedHours = [...storeHours];
    updatedHours[index]!.active = !updatedHours[index]!.active;
    setStoreHours(updatedHours);
  };

  const apiUtils = api.useUtils();

  async function handleSave() {
    const data = storeHours.map((it) => ({
      openTime: it.openTime,
      closeTime: it.closeTime,
      breakStart: it.breakStart ?? undefined,
      breakEnd: it.breakEnd ?? undefined,
      dayOfWeek: it.dayOfWeek,
      active: it.active,
    }));

    await updateMutation.mutateAsync(data);
  }

  const updateMutation = api.storeHours.update.useMutation({
    onSuccess: () => {
      toast.success("Horário de funcionamento atualizado.");
      void apiUtils.storeHours.all.invalidate();
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Horário de Funcionamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dia da Semana</TableHead>
              <TableHead>Abertura</TableHead>
              <TableHead>Fechamento</TableHead>
              <TableHead>Início Intervalo</TableHead>
              <TableHead>Fim Intervalo</TableHead>
              <TableHead>Ativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storeHours.map((hours, index) => (
              <TableRow
                key={index}
                className={hours.active ? "" : "opacity-50"}
              >
                <TableCell className="font-medium">
                  {translateWeekday(hours.dayOfWeek)}
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    value={hours.openTime}
                    onChange={(e) =>
                      handleInputChange(index, "openTime", e.target.value)
                    }
                    disabled={!hours.active}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    value={hours.closeTime}
                    onChange={(e) =>
                      handleInputChange(index, "closeTime", e.target.value)
                    }
                    disabled={!hours.active}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    value={hours.breakStart ?? ""}
                    onChange={(e) =>
                      handleInputChange(index, "breakStart", e.target.value)
                    }
                    disabled={!hours.active}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="time"
                    value={hours.breakEnd ?? ""}
                    onChange={(e) =>
                      handleInputChange(index, "breakEnd", e.target.value)
                    }
                    disabled={!hours.active}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={hours.active}
                    onCheckedChange={() => handleCheckboxChange(index)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
