export interface UazapiSendTextOptions {
  to: string;
  text: string;
  /**
   * Atraso opcional em milissegundos antes do envio.
   * Espelha o campo `delay` da API da Uazapi.
   */
  delayMs?: number;
  /**
   * Se true, usa envio assíncrono pela fila interna da Uazapi (`async`).
   */
  async?: boolean;
}

export interface UazapiSendTextResult {
  ok: boolean;
  simulated: boolean;
  error?: unknown;
}

function normalizeBrazilPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return digits;
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export async function sendText({
  to,
  text,
  delayMs,
  async,
}: UazapiSendTextOptions): Promise<UazapiSendTextResult> {
  const baseUrl = process.env.UAZAPI_BASE_URL;
  const token = process.env.UAZAPI_INSTANCE_TOKEN;

  if (!baseUrl || !token) {
    console.log("[Uazapi] Credenciais não configuradas — modo simulação");
    console.log(`  Para: ${to}`);
    console.log(`  Mensagem: ${text}`);
    return { ok: true, simulated: true };
  }

  const number = normalizeBrazilPhone(to);

  const url = new URL("/send/text", baseUrl);
  url.searchParams.set("token", token);

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        number,
        text,
        delay: typeof delayMs === "number" ? delayMs : undefined,
        async,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        "[Uazapi] Erro ao enviar mensagem:",
        response.status,
        errorText
      );
      return { ok: false, simulated: false, error: errorText || response.status };
    }

    return { ok: true, simulated: false };
  } catch (error) {
    console.error("[Uazapi] Falha na conexão:", error);
    return { ok: false, simulated: false, error };
  }
}

