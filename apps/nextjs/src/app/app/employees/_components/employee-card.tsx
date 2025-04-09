import Link from "next/link";

import type { Employee } from "@acme/db/schema";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface EmployeeCardProps {
  employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <Card>
      <CardContent className="relative pt-6">
        <Badge
          className="absolute right-2 top-2"
          variant={employee.active ? "default" : "destructive"}
        >
          {employee.active ? "Ativo" : "Desativado"}
        </Badge>
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={employee.image ?? ""} alt={employee.name} />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{employee.name}</h3>
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
