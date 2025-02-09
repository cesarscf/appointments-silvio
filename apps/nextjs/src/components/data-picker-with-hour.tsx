import { useState } from "react";
import { format } from "date-fns";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { ScrollArea } from "./ui/scroll-area";

interface DataPickerWithHourProps {
  onDateTimeChange: (timestamp: number) => void;
}

export default function DataPickerWithHour({
  onDateTimeChange,
}: DataPickerWithHourProps) {
  const today = new Date();
  const [date, setDate] = useState<Date>(today);
  const [time, setTime] = useState<string | null>(null);

  const timeSlots = [
    { time: "09:00", available: false },
    { time: "09:30", available: false },
    { time: "10:00", available: true },
    { time: "10:30", available: true },
    { time: "11:00", available: true },
    { time: "11:30", available: true },
    { time: "12:00", available: false },
    { time: "12:30", available: true },
    { time: "13:00", available: true },
    { time: "13:30", available: true },
    { time: "14:00", available: true },
    { time: "14:30", available: false },
    { time: "15:00", available: false },
    { time: "15:30", available: true },
    { time: "16:00", available: true },
    { time: "16:30", available: true },
    { time: "17:00", available: true },
    { time: "17:30", available: true },
  ];

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
    <div className="w-fit rounded-lg border border-border">
      <div className="flex max-sm:flex-col">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => handleDateChange(date!)}
          className="p-2 sm:pe-5"
          disabled={[{ before: today }]}
        />
        <div className="relative w-full max-sm:h-48 sm:w-40">
          <div className="absolute inset-0 border-border py-4 max-sm:border-t">
            <ScrollArea className="h-full border-border sm:border-s">
              <div className="space-y-3">
                <div className="flex h-5 shrink-0 items-center px-5">
                  <p className="text-sm font-medium">
                    {format(date, "EEEE, d")}
                  </p>
                </div>
                <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                  {timeSlots.map(({ time: timeSlot, available }) => (
                    <Button
                      key={timeSlot}
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
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
