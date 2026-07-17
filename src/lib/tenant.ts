import { headers } from "next/headers";
import { brand as defaultBrand } from "@/config/brand";
import type { Brand } from "@/config/brand";
import { listRecords, updateRecord } from "./airtable";
import { normalizeExternalImageUrl, textPairForBackground } from "./utils";

/** Garante hex válido quando o Airtable envia sem `#` ou com espaços. */
function normalizeColor(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  const v = String(value).trim();
  if (!v) return undefined;
  if (/^#[0-9A-Fa-f]{3,8}$/.test(v)) return v;
  if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$|^[0-9A-Fa-f]{8}$/.test(v)) return `#${v}`;
  return v;
}

type TenantFields = {
  Domain?: string;
  Name?: string;
  Tagline?: string;
  LogoUrl?: string;
  PrimaryColor?: string;
  PrimaryForeground?: string;
  SecondaryColor?: string;
  BackgroundColor?: string;
  GoldColor?: string;
  /** Texto principal; se vazio, deriva do BackgroundColor (contraste automático). */
  ForegroundColor?: string;
  /** Texto secundário; se vazio, deriva do fundo. */
  MutedForegroundColor?: string;
  Phone?: string;
  Address?: string;
  Instagram?: string;
  /** Base ID do Airtable desse tenant (workspace do barbeiro). Se vazio, usa AIRTABLE_BASE_ID do env. */
  AirtableBaseId?: string;
  /** Refresh token OAuth do Google Calendar do barbeiro. Server-only, nunca enviado ao cliente. */
  GoogleRefreshToken?: string;
  /** Minutos antes do horário para o lembrete popup no Google Calendar. Padrão 30. */
  GoogleReminderMinutes?: number;
  /** E-mail da conta Google conectada. Somente exibição no painel. */
  GoogleAccountEmail?: string;
};

const DEFAULT_GOOGLE_REMINDER_MINUTES = 30;

function isAirtableConfigured() {
  return Boolean(process.env.AIRTABLE_API_TOKEN && process.env.AIRTABLE_BASE_ID);
}

export async function getBrandForHost(host: string): Promise<Brand> {
  if (!isAirtableConfigured()) {
    return defaultBrand;
  }

  const records = await listRecords("Tenants", {
    filterByFormula: `{Domain} = '${host}'`,
    maxRecords: 1,
  });

  if (!records || records.length === 0) {
    return defaultBrand;
  }

  const fields = records[0].fields as TenantFields;

  const background =
    normalizeColor(fields.BackgroundColor) ?? defaultBrand.colors.background;
  const textPair = textPairForBackground(background);

  return {
    name: fields.Name || defaultBrand.name,
    tagline: fields.Tagline || defaultBrand.tagline,
    logo: fields.LogoUrl
      ? normalizeExternalImageUrl(fields.LogoUrl)
      : defaultBrand.logo,
    colors: {
      primary:
        normalizeColor(fields.PrimaryColor) ?? defaultBrand.colors.primary,
      primaryForeground:
        normalizeColor(fields.PrimaryForeground) ??
        defaultBrand.colors.primaryForeground,
      secondary:
        normalizeColor(fields.SecondaryColor) ?? defaultBrand.colors.secondary,
      background,
      foreground:
        normalizeColor(fields.ForegroundColor) ?? textPair.foreground,
      mutedForeground:
        normalizeColor(fields.MutedForegroundColor) ?? textPair.mutedForeground,
      gold: normalizeColor(fields.GoldColor) ?? defaultBrand.colors.gold,
    },
    contact: {
      phone: fields.Phone || defaultBrand.contact.phone,
      address: fields.Address || defaultBrand.contact.address,
      instagram: fields.Instagram || defaultBrand.contact.instagram,
    },
  };
}

export async function getCurrentBrand(): Promise<Brand> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost";
  return getBrandForHost(host);
}

/**
 * Base ID do Airtable do tenant da requisição atual.
 * Use nas actions para ler/escrever Appointments, Services, Settings, DayOffs no workspace do barbeiro.
 * Retorna null se não houver tenant ou tenant sem AirtableBaseId (aí usa a base do env).
 */
export async function getCurrentTenantBaseId(): Promise<string | null> {
  if (!isAirtableConfigured()) return null;

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost";
  const records = await listRecords("Tenants", {
    filterByFormula: `{Domain} = '${host}'`,
    maxRecords: 1,
  });

  if (!records || records.length === 0) return null;
  const baseId = (records[0].fields as TenantFields).AirtableBaseId?.trim();
  return baseId || null;
}

// ============================================================================
// Google Calendar — config por tenant.
// A tabela `Tenants` vive na base do env (AIRTABLE_BASE_ID), então leituras e
// escritas abaixo usam a base padrão (sem override). Server-only.
// ============================================================================

export interface TenantRecord {
  id: string;
  fields: TenantFields;
}

async function currentHost(): Promise<string> {
  const headersList = await headers();
  return headersList.get("host") ?? "localhost";
}

/** Registro do tenant da requisição atual (id + fields), ou null. */
export async function getCurrentTenantRecord(): Promise<TenantRecord | null> {
  if (!isAirtableConfigured()) return null;

  const host = await currentHost();
  const records = await listRecords("Tenants", {
    filterByFormula: `{Domain} = '${host}'`,
    maxRecords: 1,
  });

  if (!records || records.length === 0) return null;
  return { id: records[0].id, fields: records[0].fields as TenantFields };
}

/** Persiste refresh token + conta conectada no registro do tenant atual (V4/V7/V10). */
export async function saveGoogleConnection(params: {
  refreshToken: string;
  accountEmail: string | null;
}): Promise<boolean> {
  const record = await getCurrentTenantRecord();
  if (!record) return false;
  const updated = await updateRecord("Tenants", record.id, {
    GoogleRefreshToken: params.refreshToken,
    GoogleAccountEmail: params.accountEmail ?? "",
  });
  return updated !== null;
}

/** Remove a conexão Google do tenant atual. */
export async function clearGoogleRefreshToken(): Promise<boolean> {
  const record = await getCurrentTenantRecord();
  if (!record) return false;
  const updated = await updateRecord("Tenants", record.id, {
    GoogleRefreshToken: "",
    GoogleAccountEmail: "",
  });
  return updated !== null;
}

/** Ajusta os minutos de antecedência do lembrete popup. */
export async function saveGoogleReminderMinutes(
  minutes: number
): Promise<boolean> {
  const record = await getCurrentTenantRecord();
  if (!record) return false;
  const updated = await updateRecord("Tenants", record.id, {
    GoogleReminderMinutes: minutes,
  });
  return updated !== null;
}

export interface TenantGoogleConfig {
  refreshToken: string | null;
  reminderMinutes: number;
  accountEmail: string | null;
}

/** Config Google do tenant atual (refresh token + minutos do lembrete + conta). */
export async function getGoogleConfigForCurrentTenant(): Promise<TenantGoogleConfig | null> {
  const record = await getCurrentTenantRecord();
  if (!record) return null;
  const fields = record.fields;
  return {
    refreshToken:
      (fields.GoogleRefreshToken as string | undefined)?.trim() || null,
    reminderMinutes:
      typeof fields.GoogleReminderMinutes === "number"
        ? fields.GoogleReminderMinutes
        : DEFAULT_GOOGLE_REMINDER_MINUTES,
    accountEmail:
      (fields.GoogleAccountEmail as string | undefined)?.trim() || null,
  };
}

