/**
 * Integração write-only com o Google Calendar.
 *
 * Camada REST pura (sem dependência de Airtable/tenant): troca de tokens OAuth
 * e criação de eventos via `fetch`, no mesmo estilo de `airtable.ts` e `uazapi.ts`.
 *
 * Regras (ver SPEC §V):
 *  - Apenas events.insert. Nunca listar/ler/puxar eventos (V2).
 *  - Sem credenciais de ambiente OU sem refresh token do tenant → modo simulação (V3).
 *  - Todo evento carrega um lembrete popup (notificação) — useDefault=false (V5).
 *  - Escopo mínimo: calendar.events (V6).
 *  - Falhas são registradas e engolidas — nunca lançam (V8).
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

/** Escopo mínimo: só permite inserir eventos, não ler a agenda (V6). */
export const GOOGLE_CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar.events";

/**
 * Escopos do consentimento: calendar.events + identidade (openid email).
 * `openid email` serve só para exibir qual conta conectou (V6/V10) — não dá
 * acesso de leitura à agenda.
 */
export const GOOGLE_CONSENT_SCOPES = `openid email ${GOOGLE_CALENDAR_SCOPE}`;

/** Fuso do barbeiro (Brasil). */
export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

/** Lembrete padrão: popup 30 min antes do horário. */
export const DEFAULT_REMINDER_MINUTES = 30;

/** Credenciais OAuth presentes no ambiente (habilita modo real). */
export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * URL de consentimento OAuth (offline → devolve refresh token).
 * Retorna null se o client id não estiver configurado.
 */
export function buildConsentUrl(params: {
  redirectUri: string;
  state: string;
}): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_CONSENT_SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", params.state);
  return url.toString();
}

export interface TokenExchangeResult {
  refreshToken: string | null;
  accessToken: string | null;
  /** E-mail da conta Google que autorizou (decodificado do id_token). Só exibição. */
  email: string | null;
}

/**
 * Extrai o `email` do payload de um id_token (JWT) do Google.
 * O token vem direto do endpoint de tokens sobre TLS, então confiamos nele
 * sem verificar assinatura — uso apenas para exibir a conta conectada.
 */
function decodeIdTokenEmail(idToken: string | undefined): string | null {
  if (!idToken) return null;
  try {
    const payload = idToken.split(".")[1];
    if (!payload) return null;
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const data = JSON.parse(json) as { email?: string };
    return data.email ?? null;
  } catch {
    return null;
  }
}

/** Troca o `code` do callback por tokens. Null em falha. */
export async function exchangeCode(
  code: string,
  redirectUri: string
): Promise<TokenExchangeResult | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      console.error(
        "[Google] Falha na troca de código:",
        response.status,
        await response.text().catch(() => "")
      );
      return null;
    }

    const data = (await response.json()) as {
      refresh_token?: string;
      access_token?: string;
      id_token?: string;
    };
    return {
      refreshToken: data.refresh_token ?? null,
      accessToken: data.access_token ?? null,
      email: decodeIdTokenEmail(data.id_token),
    };
  } catch (error) {
    console.error("[Google] Erro na troca de código:", error);
    return null;
  }
}

/** Obtém um access token a partir do refresh token. Null em falha. */
export async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.error(
        "[Google] Falha ao renovar token:",
        response.status,
        await response.text().catch(() => "")
      );
      return null;
    }

    const data = (await response.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch (error) {
    console.error("[Google] Erro ao renovar token:", error);
    return null;
  }
}

export interface InsertEventParams {
  refreshToken: string;
  /** Se vazio, usa GOOGLE_CALENDAR_ID do env ou "primary". */
  calendarId?: string;
  summary: string;
  description?: string;
  /** yyyy-MM-dd */
  date: string;
  /** HH:mm */
  startTime: string;
  /** HH:mm */
  endTime: string;
  /** Minutos antes do horário para o lembrete popup. */
  reminderMinutes: number;
}

export interface InsertEventResult {
  ok: boolean;
  simulated: boolean;
  error?: unknown;
}

/**
 * Cria um evento na agenda do barbeiro com lembrete popup (notificação).
 * Write-only: só chama events.insert (V2). Nunca lança (V8).
 */
export async function insertAppointmentEvent(
  params: InsertEventParams
): Promise<InsertEventResult> {
  if (!isGoogleConfigured()) {
    console.log("[Google] Credenciais não configuradas — modo simulação");
    console.log(`  Evento: ${params.summary} @ ${params.date} ${params.startTime}`);
    return { ok: true, simulated: true };
  }

  if (!params.refreshToken) {
    console.log("[Google] Tenant sem conexão — modo simulação");
    return { ok: true, simulated: true };
  }

  const accessToken = await refreshAccessToken(params.refreshToken);
  if (!accessToken) {
    return { ok: false, simulated: false, error: "sem access token" };
  }

  const calendarId =
    params.calendarId || process.env.GOOGLE_CALENDAR_ID || "primary";
  const minutes = Number.isFinite(params.reminderMinutes)
    ? params.reminderMinutes
    : DEFAULT_REMINDER_MINUTES;

  const body = {
    summary: params.summary,
    description: params.description,
    start: {
      dateTime: `${params.date}T${params.startTime}:00`,
      timeZone: DEFAULT_TIMEZONE,
    },
    end: {
      dateTime: `${params.date}T${params.endTime}:00`,
      timeZone: DEFAULT_TIMEZONE,
    },
    // useDefault=false + override popup garante o lembrete/notificação (V5).
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes }],
    },
  };

  try {
    const url = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(
      calendarId
    )}/events`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("[Google] Falha ao criar evento:", response.status, errorText);
      return { ok: false, simulated: false, error: errorText || response.status };
    }

    return { ok: true, simulated: false };
  } catch (error) {
    console.error("[Google] Erro ao criar evento:", error);
    return { ok: false, simulated: false, error };
  }
}
