"use client";

import Image from "next/image";
import Link from "next/link";

import type { Employee } from "@acme/db/schema";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function EmployeesList({
  employees,
  slug,
}: {
  employees: Employee[];
  slug: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {employees.map((employee) => {
        if (!employee.active) return null;

        return (
          <Card
            key={employee.id}
            className="group overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <CardHeader className="p-0">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={"/placeholder.svg"}
                  alt={employee.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{employee.name}</h3>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 p-4">
              <Button asChild className="w-full">
                <Link
                  href={`/${slug}/booking-employee?step=service&employeeId=${employee.id}`}
                >
                  Agendar com {employee.name.split(" ")[0]}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
