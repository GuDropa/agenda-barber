import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, format, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Links `dropbox.com` com preview (`dl=0`) devolvem HTML. `raw=1` ou `dl=1` servem o arquivo.
 * Preserva URLs que já usam `raw=1` ou `dl=1`.
 */
export function normalizeExternalImageUrl(src: string): string {
  const s = src.trim();
  if (!s || s.startsWith("/")) return s;
  if (!/^https?:\/\//i.test(s)) return s;
  try {
    const u = new URL(s);
    const isDropboxShare =
      u.hostname === "www.dropbox.com" || u.hostname === "dropbox.com";
    if (!isDropboxShare) return s;

    if (u.searchParams.get("raw") === "1" || u.searchParams.get("dl") === "1") {
      return u.toString();
    }
    if (u.searchParams.get("dl") === "0") {
      u.searchParams.delete("dl");
    }
    u.searchParams.set("raw", "1");
    return u.toString();
  } catch {
    return s;
  }
}

/** O otimizador do Next faz fetch no servidor; o Dropbox costuma falhar — o browser carrega direto. */
export function shouldBypassNextImageOptimization(src: string): boolean {
  const s = src.trim();
  if (!s.startsWith("http")) return false;
  try {
    const h = new URL(s).hostname;
    return (
      h.endsWith(".dropbox.com") || h.endsWith("dropboxusercontent.com")
    );
  } catch {
    return false;
  }
}

/** Superfície `bg-muted` (skeletons, calendário) derivada do fundo e da cor de destaque da marca. */
export function mutedSurfaceFromBrand(background: string, accent: string): string {
  return `color-mix(in srgb, ${background} 88%, ${accent} 12%)`;
}

export function safeFormatDate(
  dateStr: string | undefined | null,
  pattern: string = "dd 'de' MMMM (EEEE)",
  fallback: string = "Data inválida"
): string {
  if (!dateStr) return fallback;
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return fallback;
    return format(date, pattern, { locale: ptBR });
  } catch {
    return fallback;
  }
}
