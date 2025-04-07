"use client";

import type { Locale } from "date-fns";
import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  locale?: Locale;
  disabled?: boolean;
  className?: string;
}

export function DateInput({
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  locale = ptBR,
  disabled = false,
  className,
}: DateInputProps) {
  const [inputValue, setInputValue] = React.useState<string>(() => {
    return value ? format(value, "dd/MM/yyyy", { locale }) : "";
  });

  // Update input value when the date value changes externally
  React.useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "dd/MM/yyyy", { locale }));
    }
  }, [value, locale]);

  // Handle direct input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse the date
    if (newValue.length === 10) {
      // Full date format DD/MM/YYYY
      const parsedDate = parse(newValue, "dd/MM/yyyy", new Date(), { locale });

      if (isValid(parsedDate)) {
        onChange(parsedDate);
      }
    }
  };

  // Optional: Add a calendar popover for easier selection
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("relative", className)}>
      <div className="flex">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
          maxLength={10}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              disabled={disabled}
              type="button"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="sr-only">Abrir calendário</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date) => {
                if (date) {
                  onChange(date);
                  setOpen(false);
                }
              }}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
              locale={locale}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
