"use server";

import {
  isAirtableConfigured,
  getAdminPasswordForCurrentTenant,
  type AdminGateState,
} from "@/lib/tenant";

/**
 * Estado do portão de acesso ao admin, sem revelar a senha (V13).
 * - "open"         → Airtable não configurado (dev/marca padrão): acesso liberado (V17).
 * - "required"     → tenant tem senha definida: exigir senha.
 * - "unconfigured" → tenant existe mas sem `AdminPassword`: negar com aviso (V17).
 */
export async function getAdminGateStatus(): Promise<AdminGateState> {
  if (!isAirtableConfigured()) return "open";
  const stored = await getAdminPasswordForCurrentTenant();
  return stored ? "required" : "unconfigured";
}

/**
 * Compara a senha digitada com a senha do tenant atual. Devolve apenas boolean
 * (V13 — nunca ecoa a senha armazenada).
 * - Airtable não configurado → true (portão aberto em dev/marca padrão, V17).
 * - Tenant sem senha definida → false ("acesso não configurado", V17).
 * - Caso contrário → igualdade exata com a senha do tenant (V15).
 */
export async function verifyAdminPassword(input: string): Promise<boolean> {
  if (!isAirtableConfigured()) return true;
  const stored = await getAdminPasswordForCurrentTenant();
  if (!stored) return false;
  return input === stored;
}
