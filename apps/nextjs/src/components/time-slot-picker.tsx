"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/trpc/react";

interface TimeSlotPickerProps {
  serviceId: string;
  establishmentId: string;
  employeeId?: string;
  setSelectedSlot: React.Dispatch<
    React.SetStateAction<{
      start: Date;
      end: Date;
    } | null>
  >;
}

export function TimeSlotPicker({
  serviceId,
  establishmentId,
  employeeId,
  setSelectedSlot,
}: TimeSlotPickerProps) {
  const today = new Date();
  const [date, setDate] = React.useState<Date>(today);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);

  const { data: availability, isLoading } =
    api.appointment.getAvailableSlots.useQuery(
      {
        serviceId,
        establishmentId,
        employeeId,
        date,
      },
      {
        enabled: !!serviceId && !!establishmentId,
      },
    );

  const timeSlots =
    availability?.availableSlots?.map((slot) => ({
      time: format(slot.start, "HH:mm"),
      start: slot.start,
      end: slot.end,
      available: true,
    })) || [];

  React.useEffect(() => {
    setSelectedTime(null);
    setSelectedSlot(null);
  }, [date]);

  const handleTimeSelect = (timeSlot: string, start: Date, end: Date) => {
    setSelectedTime(timeSlot);
    setSelectedSlot({ start, end });
  };

  return (
    <div>
      <div className="rounded-md border">
        <div className="flex max-sm:flex-col">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                console.log(date);
                setDate(newDate);
              }
            }}
            className="p-2 sm:pe-5"
            disabled={[{ before: today }]}
            locale={ptBR}
          />

          <div className="relative w-full max-sm:h-48 sm:w-40">
            <div className="absolute inset-0 py-4 max-sm:border-t">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-full sm:border-s">
                  <div className="space-y-3">
                    <div className="flex h-5 shrink-0 items-center px-5">
                      <p className="text-sm font-medium">
                        {format(date, "EEEE, d", { locale: ptBR })}
                      </p>
                    </div>

                    <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                      {timeSlots.length > 0 ? (
                        timeSlots.map(({ time, start, end }) => {
                          const isSelected = selectedTime === time;
                          return (
                            <Button
                              key={time}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              className="w-full"
                              onClick={() => handleTimeSelect(time, start, end)}
                            >
                              {time}
                            </Button>
                          );
                        })
                      ) : (
                        <p className="px-5 text-sm text-muted-foreground">
                          Nenhum horário disponível
                        </p>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
