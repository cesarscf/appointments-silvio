import Link from "next/link";

import type { Employee } from "@acme/db/schema";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface EmployeeCardProps {
  employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={employee.photo ?? ""} alt={employee.name} />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{employee.name}</h3>
            <p className="text-sm text-muted-foreground">{employee.role}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size={"sm"} className="w-full" asChild variant={"outline"}>
          <Link href={`/app/employees/${employee.id}`}>Ver detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
