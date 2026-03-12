"use client";

import { BookingData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  Scissors,
  User,
  Phone,
} from "lucide-react";

interface BookingSuccessProps {
  booking: BookingData;
  onNewBooking: () => void;
}

export function BookingSuccess({ booking, onNewBooking }: BookingSuccessProps) {
  const dateFormatted = format(
    parseISO(booking.date),
    "dd 'de' MMMM (EEEE)",
    { locale: ptBR }
  );

  return (
    <section className="px-4 pb-6 pt-8">
      <div className="text-center mb-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Agendado!</h2>
        <p className="text-muted-foreground mt-1">
          Seu horário foi confirmado com sucesso
        </p>
      </div>

      <Card className="border-green-500/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Scissors className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium">{booking.service.name}</p>
              <p className="text-sm text-muted-foreground">
                R$ {booking.service.price}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary shrink-0" />
            <p>{dateFormatted}</p>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary shrink-0" />
            <p>
              {booking.time} &bull; {booking.service.durationMinutes}min
            </p>
          </div>

          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary shrink-0" />
            <p>{booking.clientName}</p>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary shrink-0" />
            <p>{booking.clientPhone}</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6 mb-4">
        Você receberá uma confirmação via WhatsApp
      </p>

      <Button variant="outline" className="w-full h-12 cursor-pointer" onClick={onNewBooking}>
        Fazer novo agendamento
      </Button>
    </section>
  );
}
