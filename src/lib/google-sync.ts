/**
 * Orquestração tenant-aware do Google Calendar (server-only).
 *
 * Liga a camada REST pura (`google-calendar.ts`) à config do tenant
 * (`tenant.ts`). Usada pelo fluxo de criação de agendamento.
 *
 * Nunca lança: qualquer erro é registrado e engolido para não impactar o
 * agendamento (SPEC §V1/§V8).
 */

import { Appointment } from "./types";
import { getGoogleConfigForCurrentTenant } from "./tenant";
import {
  insertAppointmentEvent,
  DEFAULT_REMINDER_MINUTES,
} from "./google-calendar";

export async function syncAppointmentToGoogleCalendar(
  appointment: Appointment
): Promise<void> {
  try {
    const config = await getGoogleConfigForCurrentTenant();

    const summary = `${appointment.service?.name ?? "Agendamento"} — ${
      appointment.clientName
    }`;

    const description = [
      `Cliente: ${appointment.clientName}`,
      `Telefone: ${appointment.clientPhone}`,
      appointment.service?.name ? `Serviço: ${appointment.service.name}` : null,
      appointment.service?.price != null
        ? `Valor: R$ ${appointment.service.price}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    await insertAppointmentEvent({
      refreshToken: config?.refreshToken ?? "",
      summary,
      description,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      reminderMinutes: config?.reminderMinutes ?? DEFAULT_REMINDER_MINUTES,
    });
  } catch (error) {
    console.error("[Google] Erro ao sincronizar agendamento:", error);
  }
}
