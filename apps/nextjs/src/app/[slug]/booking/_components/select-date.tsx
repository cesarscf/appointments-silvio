"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import DataPickerWithHour2 from "./data-picker-with-hour";

interface SelectDateProps {
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate: Date;
  onNextStep: () => void;
  onBackStep: () => void;
}

export function SelectDate({
  onNextStep,
  onBackStep,
  selectedDate,
  setSelectedDate,
}: SelectDateProps) {
  const router = useRouter();

  const today = new Date();
  const [date, setDate] = React.useState<Date>(today);
  const [time, setTime] = React.useState<string | null>(null);

  function onDateTimeChange(timestamp: number) {
    setSelectedDate(new Date(timestamp));
  }

  const day = selectedDate.getDay();

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-4 text-xl font-bold">Escolha um profissional</h2>
      <div className="grid grid-cols-1">
        <DataPickerWithHour2
          onDateTimeChange={onDateTimeChange}
          day={day}
          setDate={setDate}
          date={date}
          setTime={setTime}
          time={time}
          today={today}
        />
      </div>
      <div className="flex w-full justify-between pt-5">
        <Button variant={"secondary"} onClick={onBackStep}>
          Voltar
        </Button>
        <Button onClick={onNextStep} disabled={time == null ? true : false}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
