import React from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

interface DataPickerWithHourProps {
  onDateTimeChange: (timestamp: number) => void;
  day: number;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  date: Date;
  setTime: React.Dispatch<React.SetStateAction<string | null>>;
  time: string | null;
  today: Date;
}

export default function DataPickerWithHour2({
  onDateTimeChange,
  day,
  date,
  time,
  today,
  setDate,
  setTime,
}: DataPickerWithHourProps) {
  const { data, isPending } = api.storeHours.getDayHours.useQuery(day);

  const timeSlots = isPending ? [] : generateTimeSlots(data!);

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    setTime(null);
    onDateTimeChange(newDate.getTime());
  };

  const handleTimeChange = (timeSlot: string) => {
    setTime(timeSlot);
    if (date) {
      const selectedDateTime = new Date(date);
      const [hours, minutes] = timeSlot.split(":").map(Number);
      selectedDateTime.setHours(hours!, minutes);
      onDateTimeChange(selectedDateTime.getTime());
    }
  };

  return (
    <div className="mx-auto w-fit rounded-lg border border-border">
      <div className="flex max-sm:flex-col">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => handleDateChange(date || today)}
          className="p-2 sm:pe-5"
          disabled={[{ before: today }]}
        />
        <div className="relative w-full max-sm:h-48 sm:w-[250px]">
          <div className="absolute inset-0 border-border py-4 max-sm:border-t">
            <ScrollArea className="h-full border-border sm:border-s">
              {isPending ? (
                <div className="space-y-3">
                  <div className="flex h-5 shrink-0 items-center px-5">
                    <Skeleton className="h-full min-h-6 w-full" />
                  </div>
                  <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-full min-h-6 w-full" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex h-5 shrink-0 items-center px-5">
                    <p className="text-sm font-medium">
                      {format(date, "EEEE, d")}
                    </p>
                  </div>
                  <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                    {timeSlots.map(({ time: timeSlot, available }, idx) => (
                      <Button
                        key={idx}
                        type="button"
                        variant={time === timeSlot ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => handleTimeChange(timeSlot)}
                        disabled={!available}
                      >
                        {timeSlot}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export function generateTimeSlots({
  openTime,
  closeTime,
  breakStart,
  breakEnd,
}: {
  id: string;
  storeId: string;
  openTime: string;
  closeTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  dayOfWeek: string;
  active: boolean;
}): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];
  const interval = 30;

  const formatTime = (time: number): string => {
    return time < 10 ? `0${time}` : `${time}`;
  };

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours! * 60 + mins! + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${formatTime(newHours)}:${formatTime(newMinutes)}`;
  };

  const isDuringBreak = (
    time: string,
    breakStart: string | null,
    breakEnd: string | null,
  ): boolean => {
    if (!breakStart || !breakEnd) return false;
    return time >= breakStart && time < breakEnd;
  };

  let currentTime = addMinutes(openTime, 0);
  while (currentTime < closeTime) {
    const available = !isDuringBreak(currentTime, breakStart, breakEnd);
    timeSlots.push({ time: currentTime, available });
    currentTime = addMinutes(currentTime, interval);
  }

  return timeSlots;
}
