"use client";

import { TimeSlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  loading?: boolean;
}

export function TimeSlots({
  slots,
  selectedTime,
  onSelectTime,
  loading,
}: TimeSlotsProps) {
  const availableSlots = slots.filter((s) => s.available);

  if (loading) {
    return (
      <section className="px-6 pb-6">
        <h2 className="text-lg font-semibold mb-4">Horários disponíveis</h2>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <section className="px-6 pb-6">
        <h2 className="text-lg font-semibold mb-4">Horários disponíveis</h2>
        <div className="flex flex-col items-center py-8 text-muted-foreground">
          <Clock className="h-8 w-8 mb-2" />
          <p>Nenhum horário disponível neste dia</p>
          <p className="text-sm">Tente outro dia</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-6">
      <h2 className="text-lg font-semibold mb-4">
        Horários disponíveis
        <span className="text-sm font-normal text-muted-foreground ml-2">
          ({availableSlots.length} vagas)
        </span>
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => onSelectTime(slot.time)}
            className={cn(
              "h-12 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
              !slot.available
                ? "opacity-30 cursor-not-allowed bg-muted line-through"
                : selectedTime === slot.time
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "bg-card border border-border hover:border-primary/50 active:scale-95"
            )}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </section>
  );
}
