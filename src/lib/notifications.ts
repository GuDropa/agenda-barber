import { BookingData } from "./types";
import { safeFormatDate } from "./utils";
import { sendText } from "./uazapi";
import { getCurrentBrand } from "./tenant";

export interface NotificationResult {
  to: string;
  message: string;
  sent: boolean;
}

function formatDate(dateStr: string): string {
  return safeFormatDate(dateStr, "dd 'de' MMMM");
}

export class NotificationService {
  static async sendBookingConfirmation(
    booking: BookingData
  ): Promise<NotificationResult> {
    const brand = await getCurrentBrand();
    const dateFormatted = formatDate(booking.date);

    const message =
      `✅ *${brand.name}*\n\n` +
      `Olá *${booking.clientName}*, seu horário foi confirmado!\n\n` +
      `💈 *Serviço:* ${booking.service.name}\n` +
      `📅 *Data:* ${dateFormatted}\n` +
      `⏰ *Horário:* ${booking.time}\n` +
      `💰 *Valor:* R$ ${booking.service.price}\n\n` +
      `Até lá! 🤙`;

    const result = await sendText({
      to: booking.clientPhone,
      text: message,
      async: true,
    });

    return {
      to: booking.clientPhone,
      message,
      sent: result.ok,
    };
  }

  static async notifyBarber(
    booking: BookingData
  ): Promise<NotificationResult> {
    const brand = await getCurrentBrand();
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
    const result = await sendText({
      to: barberPhone,
      text: message,
      async: true,
    });

    return {
      to: barberPhone,
      message,
      sent: result.ok,
    };
  }

  static async sendCancellationNotice(
    clientPhone: string,
    clientName: string,
    serviceName: string,
    date: string,
    time: string
  ): Promise<NotificationResult> {
    const brand = await getCurrentBrand();
    const dateFormatted = formatDate(date);

    const message =
      `❌ *${brand.name}*\n\n` +
      `Olá *${clientName}*, infelizmente seu horário foi cancelado.\n\n` +
      `💈 *Serviço:* ${serviceName}\n` +
      `📅 *Data:* ${dateFormatted}\n` +
      `⏰ *Horário:* ${time}\n\n` +
      `Entre em contato para reagendar: ${brand.contact.phone}`;

    const result = await sendText({
      to: clientPhone,
      text: message,
      async: true,
    });

    return {
      to: clientPhone,
      message,
      sent: result.ok,
    };
  }
}
