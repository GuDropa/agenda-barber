"use client";

import { useRef } from "react";
import {
  format,
  addDays,
  isSameDay,
  isToday,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayOff } from "@/lib/types";

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  dayOffs: DayOff[];
  daysToShow?: number;
}

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  dayOffs,
  daysToShow = 21,
}: CalendarPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = startOfDay(new Date());

  const days = Array.from({ length: daysToShow }, (_, i) =>
    addDays(today, i)
  );

  const isDayOff = (date: Date) =>
    dayOffs.some((off) => off.date === format(date, "yyyy-MM-dd"));

  const isSunday = (date: Date) => date.getDay() === 0;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="pb-6">
      <div className="flex items-center justify-between px-6 mb-4">
        <h2 className="text-lg font-semibold">Escolha o dia</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-6 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {days.map((day) => {
          const isOff = isDayOff(day) || isSunday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayName = format(day, "EEE", { locale: ptBR });
          const dayNum = format(day, "dd");
          const monthName = format(day, "MMM", { locale: ptBR });

          return (
            <button
              key={day.toISOString()}
              disabled={isOff}
              onClick={() => onSelectDate(day)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[4.5rem] h-[5.5rem] rounded-xl border-2 transition-all duration-200 shrink-0 cursor-pointer",
                isOff
                  ? "opacity-40 cursor-not-allowed border-transparent bg-muted"
                  : isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-card hover:border-primary/30 active:scale-95",
                isToday(day) && !isSelected && !isOff && "border-primary/30"
              )}
            >
              <span className="text-[0.65rem] uppercase font-medium text-muted-foreground">
                {dayName}
              </span>
              <span
                className={cn(
                  "text-2xl font-bold",
                  isSelected && "text-primary"
                )}
              >
                {dayNum}
              </span>
              <span className="text-[0.65rem] uppercase text-muted-foreground">
                {monthName}
              </span>
              {isToday(day) && (
                <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
