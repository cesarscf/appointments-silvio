"use client";

import React from "react";
import { CalendarIcon, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePeriodFilter } from "./use-period-filter";

export function PeriodFilter() {
  const { startDate, endDate, setStartDate, setEndDate, resetFilters } =
    usePeriodFilter();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Período:</span>

        {/* Data Inicial */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                format(startDate, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Data inicial</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground">até</span>

        {/* Data Final */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? (
                format(endDate, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>Data final</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
              locale={ptBR}
              disabled={(date) => (startDate ? date < startDate : false)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Botão de Reset */}
      <Button
        variant="ghost"
        size="sm"
        onClick={resetFilters}
        className="h-9 px-2"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="sr-only">Resetar filtros</span>
      </Button>

      {/* Filtros rápidos */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const today = new Date();
            setStartDate(today);
            setEndDate(today);
          }}
        >
          Hoje
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            setStartDate(weekStart);
            setEndDate(weekEnd);
          }}
        >
          Esta semana
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const today = new Date();
            const monthStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              1,
            );
            const monthEnd = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              0,
            );
            setStartDate(monthStart);
            setEndDate(monthEnd);
          }}
        >
          Este mês
        </Button>
      </div>
    </div>
  );
}
