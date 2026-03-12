"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Service } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  Scissors,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const bookingSchema = z.object({
  clientName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  clientPhone: z
    .string()
    .min(15, "Telefone inválido")
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Formato: (11) 99999-9999"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  service: Service;
  date: string;
  time: string;
  onConfirm: (data: BookingFormData) => Promise<void>;
  onBack: () => void;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7)
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function BookingForm({
  service,
  date,
  time,
  onConfirm,
  onBack,
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { clientName: "", clientPhone: "" },
  });

  const phoneValue = watch("clientPhone");

  const dateFormatted = format(parseISO(date), "dd 'de' MMMM (EEEE)", {
    locale: ptBR,
  });

  return (
    <section className="px-4 pb-6">
      <Button variant="ghost" className="mb-4 cursor-pointer" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Confirmar Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Scissors className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium">{service.name}</span>
              <span className="text-muted-foreground">
                &bull; R$ {service.price}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-primary shrink-0" />
              <span>{dateFormatted}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>
                {time} &bull; {service.durationMinutes}min
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Seu nome</Label>
              <Input
                id="clientName"
                placeholder="Ex: João Silva"
                className="h-12 text-base"
                {...register("clientName")}
              />
              {errors.clientName && (
                <p className="text-sm text-destructive">
                  {errors.clientName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">WhatsApp</Label>
              <Input
                id="clientPhone"
                placeholder="(11) 99999-9999"
                className="h-12 text-base"
                type="tel"
                value={phoneValue}
                onChange={(e) => {
                  setValue("clientPhone", formatPhone(e.target.value));
                }}
              />
              {errors.clientPhone && (
                <p className="text-sm text-destructive">
                  {errors.clientPhone.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                "Confirmar Agendamento"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
