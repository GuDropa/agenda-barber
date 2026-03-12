"use client";

import { useState } from "react";
import { Appointment } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { parseISO, isToday, isTomorrow } from "date-fns";
import { safeFormatDate } from "@/lib/utils";
import {
  User,
  Phone,
  X,
  Scissors,
  AlertTriangle,
  CalendarDays,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgendaViewProps {
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
}

function groupByDate(
  appointments: Appointment[]
): Record<string, Appointment[]> {
  return appointments.reduce(
    (acc, apt) => {
      if (!acc[apt.date]) acc[apt.date] = [];
      acc[apt.date].push(apt);
      return acc;
    },
    {} as Record<string, Appointment[]>
  );
}

function getDateLabel(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
  } catch { /* fallthrough */ }
  return safeFormatDate(dateStr, "EEEE, dd 'de' MMMM");
}

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green-500/10 text-green-500 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
};

export function AgendaView({
  appointments,
  onCancelAppointment,
}: AgendaViewProps) {
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  const activeAppointments = appointments
    .filter((a) => a.status !== "CANCELLED")
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

  const grouped = groupByDate(activeAppointments);

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    onCancelAppointment(cancelTarget.id);
    setCancelTarget(null);
  };

  if (activeAppointments.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-muted-foreground">
        <Scissors className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Nenhum agendamento</p>
        <p className="text-sm">Novos clientes aparecerão aqui</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, apts]) => (
          <div key={date}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {getDateLabel(date)}
            </h3>
            <div className="space-y-2">
              {apts.map((apt) => (
                <Card
                  key={apt.id}
                  className={cn(apt.status === "CANCELLED" && "opacity-50")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={statusColors[apt.status]}
                          >
                            {statusLabels[apt.status]}
                          </Badge>
                          <span className="text-sm font-mono text-muted-foreground">
                            {apt.startTime} - {apt.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {apt.service?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{apt.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{apt.clientPhone}</span>
                        </div>
                      </div>
                      {apt.status === "CONFIRMED" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => setCancelTarget(apt)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmação de cancelamento */}
      <Dialog
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">
              Cancelar agendamento?
            </DialogTitle>
            <DialogDescription className="text-center">
              O cliente será notificado sobre o cancelamento via WhatsApp.
            </DialogDescription>
          </DialogHeader>

          {cancelTarget && (
            <div className="space-y-2 rounded-lg bg-muted/50 p-4 my-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{cancelTarget.clientName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Scissors className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{cancelTarget.service?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  {safeFormatDate(cancelTarget.date)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  {cancelTarget.startTime} - {cancelTarget.endTime}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCancelTarget(null)}
            >
              Manter
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirmCancel}
            >
              Cancelar horário
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
