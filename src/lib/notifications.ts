import { BookingData } from "./types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { evolutionApi, brand } from "@/config/brand";

interface EvolutionApiResponse {
  key: { id: string };
  message: { extendedTextMessage?: { text: string } };
  status: string;
}

function phoneToJid(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return `${number}@s.whatsapp.net`;
}

async function sendWhatsApp(
  phone: string,
  text: string
): Promise<EvolutionApiResponse | null> {
  const { baseUrl, apiKey, instance } = evolutionApi;

  if (!apiKey) {
    console.log("[Evolution API] API key não configurada — modo simulação");
    console.log(`  Para: ${phone}`);
    console.log(`  Mensagem: ${text}`);
    return null;
  }

  try {
    const response = await fetch(
      `${baseUrl}/message/sendText/${instance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey,
        },
        body: JSON.stringify({
          number: phoneToJid(phone),
          text,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[Evolution API] Erro ao enviar:", response.status, error);
      return null;
    }

    const data = (await response.json()) as EvolutionApiResponse;
    console.log("[Evolution API] Mensagem enviada:", data.key?.id);
    return data;
  } catch (error) {
    console.error("[Evolution API] Falha na conexão:", error);
    return null;
  }
}

export interface NotificationResult {
  to: string;
  message: string;
  sent: boolean;
}

function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "dd 'de' MMMM", { locale: ptBR });
}

export class NotificationService {
  static async sendBookingConfirmation(
    booking: BookingData
  ): Promise<NotificationResult> {
    const dateFormatted = formatDate(booking.date);

    const message =
      `✅ *${brand.name}*\n\n` +
      `Olá *${booking.clientName}*, seu horário foi confirmado!\n\n` +
      `💈 *Serviço:* ${booking.service.name}\n` +
      `📅 *Data:* ${dateFormatted}\n` +
      `⏰ *Horário:* ${booking.time}\n` +
      `💰 *Valor:* R$ ${booking.service.price}\n\n` +
      `Até lá! 🤙`;

    const result = await sendWhatsApp(booking.clientPhone, message);

    return {
      to: booking.clientPhone,
      message,
      sent: result !== null,
    };
  }

  static async notifyBarber(
    booking: BookingData
  ): Promise<NotificationResult> {
    const dateFormatted = formatDate(booking.date);

    const message =
      `📋 *Novo agendamento!*\n\n` +
      `👤 *Cliente:* ${booking.clientName}\n` +
      `📱 *Telefone:* ${booking.clientPhone}\n` +
      `💈 *Serviço:* ${booking.service.name}\n` +
      `📅 *Data:* ${dateFormatted}\n` +
      `⏰ *Horário:* ${booking.time}\n` +
      `💰 *Valor:* R$ ${booking.service.price}`;

    const barberPhone = brand.contact.phone;
    const result = await sendWhatsApp(barberPhone, message);

    return {
      to: barberPhone,
      message,
      sent: result !== null,
    };
  }

  static async sendCancellationNotice(
    clientPhone: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string
  ): Promise<NotificationResult> {
    const dateFormatted = formatDate(date);

    const message =
      `❌ *${brand.name}*\n\n` +
      `Olá *${clientName}*, infelizmente seu horário foi cancelado.\n\n` +
      `💈 *Serviço:* ${serviceName}\n` +
      `📅 *Data:* ${dateFormatted}\n` +
      `⏰ *Horário:* ${time}\n\n` +
      `Entre em contato para reagendar: ${brand.contact.phone}`;

    const result = await sendWhatsApp(clientPhone, message);

    return {
      to: clientPhone,
      message,
      sent: result !== null,
    };
  }
}
