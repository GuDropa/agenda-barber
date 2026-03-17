"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgendaView } from "@/components/admin/agenda-view";
import { ServiceManagement } from "@/components/admin/service-management";
import { ScheduleSettingsForm } from "@/components/admin/schedule-settings";
import { DayOffManagement } from "@/components/admin/day-off-management";
import { Service, Appointment, ScheduleSettings, DayOff } from "@/lib/types";
import { brand } from "@/config/brand";
import { CalendarDays, Scissors, Settings, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "@/app/actions/services";
import {
  getAppointments,
  cancelAppointment,
} from "@/app/actions/appointments";
import {
  getScheduleSettings,
  updateScheduleSettings,
  getDayOffs,
  createDayOff,
  deleteDayOff,
} from "@/app/actions/settings";

export default function AdminPage() {
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
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancelAppointment = async (id: string) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    const success = await cancelAppointment(id);

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "CANCELLED" as const } : a
      )
    );

    toast.success(
      success
        ? "Agendamento cancelado e cliente notificado."
        : "Cancelado localmente (Airtable não configurado)."
    );
  };

  const handleAddService = async (data: Omit<Service, "id" | "active">) => {
    const newService = await createService(data);
    if (newService) {
      setServices((prev) => [...prev, newService]);
    } else {
      setServices((prev) => [
        ...prev,
        { ...data, id: `svc-${Date.now()}`, active: true },
      ]);
    }
    toast.success("Serviço criado com sucesso!");
  };

  const handleUpdateService = async (id: string, data: Partial<Service>) => {
    const updated = await updateService(id, data);
    if (updated) {
      setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } else {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    }
    toast.success("Serviço atualizado!");
  };

  const handleDeleteService = async (id: string) => {
    await deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
    toast.success("Serviço removido!");
  };

  const handleSaveSettings = async (settings: ScheduleSettings) => {
    const updated = await updateScheduleSettings(settings);
    setScheduleSettings(updated || settings);
    toast.success("Configurações salvas!");
  };

  const handleAddDayOff = async (date: string, reason: string) => {
    const newOff = await createDayOff(date, reason || undefined);
    if (newOff) {
      setDayOffs((prev) => [...prev, newOff]);
    } else {
      setDayOffs((prev) => [
        ...prev,
        { id: `off-${Date.now()}`, date, reason: reason || undefined },
      ]);
    }
    toast.success("Folga adicionada!");
  };

  const handleDeleteDayOff = async (id: string) => {
    await deleteDayOff(id);
    setDayOffs((prev) => prev.filter((d) => d.id !== id));
    toast.success("Folga removida!");
  };

  if (loading) {
    return (
      <div className="min-h-dvh max-w-lg mx-auto flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh max-w-lg mx-auto">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">{brand.name}</h1>
            <p className="text-xs text-muted-foreground">
              Painel Administrativo
            </p>
          </div>
          <Button variant="ghost" size="icon" render={<Link href="/" />}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Tabs defaultValue="agenda" className="p-4">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="agenda" className="text-xs sm:text-sm">
            <CalendarDays className="h-4 w-4 mr-1" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="services" className="text-xs sm:text-sm">
            <Scissors className="h-4 w-4 mr-1" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">
            <Settings className="h-4 w-4 mr-1" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agenda" className="mt-4">
          <AgendaView
            appointments={appointments}
            onCancelAppointment={handleCancelAppointment}
          />
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <ServiceManagement
            services={services}
            onAdd={handleAddService}
            onUpdate={handleUpdateService}
            onDelete={handleDeleteService}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          {scheduleSettings && (
            <ScheduleSettingsForm
              settings={scheduleSettings}
              onSave={handleSaveSettings}
            />
          )}
          <DayOffManagement
            dayOffs={dayOffs}
            onAdd={handleAddDayOff}
            onDelete={handleDeleteDayOff}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
