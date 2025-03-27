import { Check } from "lucide-react";

import { Employee } from "@acme/db/schema";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface EmployeeSelectionProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelectEmployee: (employee: Employee) => void;
}

export function EmployeeSelection({
  employees,
  selectedEmployee,
  onSelectEmployee,
}: EmployeeSelectionProps) {
  return (
    <div className="space-y-2">
      {employees.map((employee) => (
        <div
          key={employee.id}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent",
            selectedEmployee?.id === employee.id && "bg-accent",
          )}
          onClick={() => onSelectEmployee(employee)}
        >
          <Avatar>
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
            <AvatarImage src="/placeholder.svg" />
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{employee.name}</p>
            <p className="text-xs text-muted-foreground">Profissional</p>
          </div>
          {selectedEmployee?.id === employee.id && (
            <Check className="h-5 w-5 text-primary" />
          )}
        </div>
      ))}
    </div>
  );
}
