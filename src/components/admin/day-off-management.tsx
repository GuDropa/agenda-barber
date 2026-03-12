"use client";

import { useState } from "react";
import { DayOff } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, CalendarOff } from "lucide-react";

interface DayOffManagementProps {
  dayOffs: DayOff[];
  onAdd: (date: string, reason: string) => void;
  onDelete: (id: string) => void;
}

export function DayOffManagement({
  dayOffs,
  onAdd,
  onDelete,
}: DayOffManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  const handleAdd = () => {
    if (!newDate) return;
    onAdd(newDate, newReason);
    setDialogOpen(false);
    setNewDate("");
    setNewReason("");
  };

  const sortedDayOffs = [...dayOffs].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Folgas e Ausências</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </DialogTrigger>
            <DialogContent className="max-w-sm mx-4">
              <DialogHeader>
                <DialogTitle>Nova Folga</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Motivo (opcional)</Label>
                  <Input
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    placeholder="Ex: Feriado, dia pessoal..."
                  />
                </div>
                <Button
                  onClick={handleAdd}
                  className="w-full"
                  disabled={!newDate}
                >
                  Adicionar Folga
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sortedDayOffs.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-muted-foreground">
            <CalendarOff className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma folga cadastrada</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedDayOffs.map((off) => (
              <div
                key={off.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
              >
                <div>
                  <p className="font-medium text-sm">
                    {format(parseISO(off.date), "dd 'de' MMMM (EEEE)", {
                      locale: ptBR,
                    })}
                  </p>
                  {off.reason && (
                    <p className="text-xs text-muted-foreground">
                      {off.reason}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(off.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
