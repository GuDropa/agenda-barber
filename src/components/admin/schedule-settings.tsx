"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScheduleSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save } from "lucide-react";

const settingsSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  lunchStart: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  lunchEnd: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  slotInterval: z.number().min(10, "Mínimo 10 minutos").max(120, "Máximo 120 minutos"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface ScheduleSettingsFormProps {
  settings: ScheduleSettings;
  onSave: (settings: ScheduleSettings) => void;
}

export function ScheduleSettingsForm({
  settings,
  onSave,
}: ScheduleSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      startTime: settings.startTime,
      endTime: settings.endTime,
      lunchStart: settings.lunchStart,
      lunchEnd: settings.lunchEnd,
      slotInterval: settings.slotInterval,
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    onSave({ ...settings, ...data });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Horário de Funcionamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Abertura</Label>
              <Input type="time" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-sm text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Fechamento</Label>
              <Input type="time" {...register("endTime")} />
              {errors.endTime && (
                <p className="text-sm text-destructive">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Início Almoço</Label>
              <Input type="time" {...register("lunchStart")} />
              {errors.lunchStart && (
                <p className="text-sm text-destructive">
                  {errors.lunchStart.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Fim Almoço</Label>
              <Input type="time" {...register("lunchEnd")} />
              {errors.lunchEnd && (
                <p className="text-sm text-destructive">
                  {errors.lunchEnd.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Intervalo entre horários (min)</Label>
            <Input type="number" {...register("slotInterval", { valueAsNumber: true })} />
            {errors.slotInterval && (
              <p className="text-sm text-destructive">
                {errors.slotInterval.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={!isDirty}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
