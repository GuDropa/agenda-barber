import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, format, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
