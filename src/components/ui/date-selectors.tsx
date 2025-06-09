"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DateSelectorsProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  fromYear: number;
  toYear: number;
  disabled?: boolean;
}

const months = [
  { value: 0, label: "Janeiro" },
  { value: 1, label: "Fevereiro" },
  { value: 2, label: "Março" },
  { value: 3, label: "Abril" },
  { value: 4, label: "Maio" },
  { value: 5, label: "Junho" },
  { value: 6, label: "Julho" },
  { value: 7, label: "Agosto" },
  { value: 8, label: "Setembro" },
  { value: 9, label: "Outubro" },
  { value: 10, label: "Novembro" },
  { value: 11, label: "Dezembro" },
];

export function DateSelectors({ value, onChange, fromYear, toYear, disabled }: DateSelectorsProps) {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    value?.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    value?.getMonth()
  );
  const [selectedDay, setSelectedDay] = useState<number | undefined>(
    value?.getDate()
  );

  const years = Array.from(
    { length: toYear - fromYear + 1 },
    (_, i) => toYear - i
  );

  // Update internal state if the external `value` prop changes
  useEffect(() => {
    if (value) {
      const year = value.getFullYear();
      const month = value.getMonth();
      const day = value.getDate();
      if(year !== selectedYear) setSelectedYear(year);
      if(month !== selectedMonth) setSelectedMonth(month);
      if(day !== selectedDay) setSelectedDay(day);
    } else {
      setSelectedYear(undefined);
      setSelectedMonth(undefined);
      setSelectedDay(undefined);
    }
  }, [value]);

  // When dropdowns change, update the external form state
  useEffect(() => {
    if (selectedYear !== undefined && selectedMonth !== undefined && selectedDay !== undefined) {
      const newDate = new Date(selectedYear, selectedMonth, selectedDay);
      // Check if the generated date is valid and different from the current value
      if (!isNaN(newDate.getTime()) && newDate.getDate() === selectedDay) {
         if(value?.getTime() !== newDate.getTime()) {
            onChange(newDate);
         }
      }
    } else {
        if (value !== undefined) {
           onChange(undefined);
        }
    }
  }, [selectedYear, selectedMonth, selectedDay, onChange, value]);

  const daysInMonth =
    selectedYear !== undefined && selectedMonth !== undefined
      ? new Date(selectedYear, selectedMonth + 1, 0).getDate()
      : 31;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
   // If month/year changes and selected day is no longer valid, reset it
  useEffect(() => {
    if(selectedDay && selectedDay > daysInMonth) {
        setSelectedDay(undefined);
    }
  }, [daysInMonth, selectedDay]);

  return (
    <div className="flex gap-2">
      <Select
        value={selectedDay?.toString()}
        onValueChange={(day) => setSelectedDay(parseInt(day))}
        disabled={disabled}

      >
        <SelectTrigger className={cn(disabled && "text-muted-foreground")}>
          <SelectValue placeholder="Dia" />
        </SelectTrigger>
        <SelectContent>
          {days.map((day) => (
            <SelectItem key={day} value={day.toString()}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedMonth?.toString()}
        onValueChange={(month) => {
          setSelectedMonth(parseInt(month));
        }}
        disabled={disabled}
      >
        <SelectTrigger className={cn(disabled && "text-muted-foreground")}>
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value.toString()}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedYear?.toString()}
        onValueChange={(year) => {
            setSelectedYear(parseInt(year));
            // Reset month and day if year changes
            if(selectedMonth !== undefined) setSelectedMonth(undefined);
            if(selectedDay !== undefined) setSelectedDay(undefined);
        }}
        disabled={disabled}
      >
        <SelectTrigger className={cn(disabled && "text-muted-foreground")}>
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

