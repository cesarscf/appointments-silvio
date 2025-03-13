"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import type { Employee } from "@acme/db/schema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SelectEmployeeProps {
  employees: Employee[];
  onEmployeeSelect: (employee: Employee) => void;
  selectedEmployeeId: string | undefined;
  onNextStep: () => void;
  onBackStep: () => void;
}

export function SelectEmployee({
  employees,
  onEmployeeSelect,
  selectedEmployeeId,
  onNextStep,
  onBackStep,
}: SelectEmployeeProps) {
  return (
    <div className="mx-auto max-w-3xl rounded border p-6">
      <h2 className="mb-4 text-xl font-bold">Escolha um profissional</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {employees.map((employee) => {
          const available = true;

          return (
            <Card
              key={employee.id}
              className={`cursor-pointer ${
                selectedEmployeeId === employee.id
                  ? "border-2 border-primary"
                  : "border border-border hover:border-primary/50"
              } ${!available ? "opacity-60" : ""}`}
              onClick={() => {
                if (available) {
                  onEmployeeSelect(employee);
                }
              }}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full">
                  <Image
                    src={"/placeholder.svg"}
                    alt={employee.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{employee.name}</h3>
                    {!available && (
                      <Badge variant="outline" className="text-xs">
                        Indisponível
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {employee.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex w-full justify-between pt-5">
        <Button variant={"secondary"} onClick={onBackStep}>
          Voltar
        </Button>
        <Button
          onClick={onNextStep}
          disabled={selectedEmployeeId == null ? true : false}
          className="ml-auto"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
