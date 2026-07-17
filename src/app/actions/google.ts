"use server";

import { isGoogleConfigured } from "@/lib/google-calendar";
import {
  getGoogleConfigForCurrentTenant,
  clearGoogleRefreshToken,
  saveGoogleReminderMinutes,
} from "@/lib/tenant";

export interface GoogleCalendarStatus {
  /** Credenciais OAuth presentes no servidor (integração habilitada). */
  configured: boolean;
  /** Tenant atual já conectou a agenda (tem refresh token). */
  connected: boolean;
  /** Minutos de antecedência do lembrete popup. */
  reminderMinutes: number;
  /** E-mail da conta Google conectada (exibição). Null se desconhecido. */
  accountEmail: string | null;
}

export async function getGoogleCalendarStatus(): Promise<GoogleCalendarStatus> {
  const configured = isGoogleConfigured();
  const config = await getGoogleConfigForCurrentTenant();
  return {
    configured,
    connected: Boolean(config?.refreshToken),
    reminderMinutes: config?.reminderMinutes ?? 30,
    accountEmail: config?.accountEmail ?? null,
  };
}

export async function disconnectGoogleCalendar(): Promise<boolean> {
  return clearGoogleRefreshToken();
}

export async function setGoogleReminderMinutes(
  minutes: number
): Promise<boolean> {
  const safe = Math.max(0, Math.min(1440, Math.round(minutes)));
  return saveGoogleReminderMinutes(safe);
}
