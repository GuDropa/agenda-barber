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

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function relativeLuminanceSrgb(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Texto principal e secundário coerentes com o fundo (evita texto claro em fundo claro).
 * Se o tenant informar ForegroundColor / MutedForegroundColor no Airtable, use-os em vez disto.
 */
export function textPairForBackground(backgroundHex: string): {
  foreground: string;
  mutedForeground: string;
} {
  const rgb = parseHexRgb(backgroundHex);
  if (!rgb) {
    return { foreground: "#fafafa", mutedForeground: "#a3a3a3" };
  }
  const lum = relativeLuminanceSrgb(rgb.r, rgb.g, rgb.b);
  if (lum > 0.45) {
    return { foreground: "#1a1a1a", mutedForeground: "#525252" };
  }
  return { foreground: "#fafafa", mutedForeground: "#a3a3a3" };
}

export function borderMixFromBrand(foreground: string, background: string): string {
  return `color-mix(in srgb, ${foreground} 14%, ${background} 86%)`;
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
