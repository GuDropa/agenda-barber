"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { HeroSection } from "@/components/booking/hero-section";
import { brand } from "@/config/brand";
import { ServiceSelector } from "@/components/booking/service-selector";
import { CalendarPicker } from "@/components/booking/calendar-picker";
import { TimeSlots } from "@/components/booking/time-slots";
import { BookingForm } from "@/components/booking/booking-form";
import { BookingSuccess } from "@/components/booking/booking-success";
import { calculateAvailableSlots } from "@/lib/availability";
import { Service, BookingData, BookingStep, Appointment, ScheduleSettings, DayOff } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { getServices } from "@/app/actions/services";
import { getAppointments, createAppointment } from "@/app/actions/appointments";
import { getScheduleSettings } from "@/app/actions/settings";
import { getDayOffs } from "@/app/actions/settings";

const STEPS: { key: BookingStep; label: string }[] = [
  { key: "service", label: "Serviço" },
  { key: "datetime", label: "Data & Hora" },
  { key: "confirm", label: "Dados" },
  { key: "success", label: "Confirmação" },
];

function StepIndicator({ current }: { current: BookingStep }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center gap-2 px-6 pb-6">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                i <= currentIdx ? "bg-primary scale-125" : "bg-muted-foreground/30"
              )}
            />
            <span
              className={cn(
                "text-[0.6rem] font-medium transition-colors duration-300",
                i === currentIdx
                  ? "text-primary"
                  : i < currentIdx
                    ? "text-muted-foreground"
                    : "text-muted-foreground/40"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "h-px w-6 mb-4 transition-colors duration-300",
                i < currentIdx ? "bg-primary" : "bg-muted-foreground/20"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-4 space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-muted" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [step, setStep] = useState<BookingStep>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings | null>(null);
  const [dayOffs, setDayOffs] = useState<DayOff[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [svc, apts, settings, offs] = await Promise.all([
        getServices(),
        getAppointments(),
        getScheduleSettings(),
        getDayOffs(),
      ]);
      setServices(svc);
      setAppointments(apts);
      setScheduleSettings(settings);
      setDayOffs(offs);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar dados. Usando dados de demonstração.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedService || !scheduleSettings) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return calculateAvailableSlots(
      dateStr,
      selectedService.durationMinutes,
      appointments,
      scheduleSettings,
      dayOffs
    );
  }, [selectedDate, selectedService, appointments, scheduleSettings, dayOffs]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    if (service.id !== selectedService?.id) {
      setSelectedTime(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleConfirm = async (data: {
    clientName: string;
    clientPhone: string;
  }) => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const [h, m] = selectedTime.split(":").map(Number);
    const endMinutes = h * 60 + m + selectedService.durationMinutes;
    const endTime = `${Math.floor(endMinutes / 60)
      .toString()
      .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;

    const newApt = await createAppointment({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      serviceDuration: selectedService.durationMinutes,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      date: dateStr,
      startTime: selectedTime,
      endTime,
    });

    const booking: BookingData = {
      service: selectedService,
      date: dateStr,
      time: selectedTime,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
    };

    if (newApt) {
      setAppointments((prev) => [...prev, newApt]);
    } else {
      const fallbackApt: Appointment = {
        id: `apt-${Date.now()}`,
        serviceId: selectedService.id,
        service: selectedService,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        date: dateStr,
        startTime: selectedTime,
        endTime,
        status: "CONFIRMED",
        createdAt: new Date().toISOString(),
      };
      setAppointments((prev) => [...prev, fallbackApt]);
    }

    toast.success("Agendamento confirmado!");
    setBookingData(booking);
    setStep("success");
  };

  const handleNewBooking = () => {
    setStep("service");
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingData(null);
  };

  return (
    <main className="min-h-dvh max-w-lg mx-auto pb-28">
      <HeroSection
        name={brand.name}
        tagline={brand.tagline}
        logo={brand.logo}
      />

      {step !== "success" && <StepIndicator current={step} />}

      {/* ETAPA 1 — Selecionar Serviço */}
      {step === "service" && (
        <>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <ServiceSelector
              services={services}
              selectedService={selectedService}
              onSelect={handleServiceSelect}
            />
          )}
        </>
      )}

      {/* ETAPA 2 — Selecionar Dia + Horário */}
      {step === "datetime" && selectedService && (
        <>
          <CalendarPicker
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
            dayOffs={dayOffs}
          />

          {selectedDate && (
            <TimeSlots
              slots={availableSlots}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
            />
          )}
        </>
      )}

      {/* ETAPA 3 — Preencher Dados */}
      {step === "confirm" &&
        selectedService &&
        selectedDate &&
        selectedTime && (
          <BookingForm
            service={selectedService}
            date={format(selectedDate, "yyyy-MM-dd")}
            time={selectedTime}
            onConfirm={handleConfirm}
            onBack={() => setStep("datetime")}
          />
        )}

      {/* ETAPA 4 — Confirmação */}
      {step === "success" && bookingData && (
        <BookingSuccess booking={bookingData} onNewBooking={handleNewBooking} />
      )}

      {/* Barra fixa de ações no rodapé */}
      {step !== "success" && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-background/90 backdrop-blur border-t px-6 pt-3 pb-4">
          {step === "service" && (
            <Button
              className="w-full h-14 text-base font-semibold"
              disabled={!selectedService || loading}
              onClick={() => setStep("datetime")}
            >
              Continuar
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          )}

          {step === "datetime" && selectedService && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="h-12 text-sm"
                onClick={() => setStep("service")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <Button
                className="flex-1 h-12 text-base font-semibold"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep("confirm")}
              >
                Continuar
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
