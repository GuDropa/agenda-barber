import { Appointment, ScheduleSettings, DayOff, TimeSlot } from "./types";

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function calculateAvailableSlots(
  date: string,
  serviceDurationMinutes: number,
  appointments: Appointment[],
  settings: ScheduleSettings,
  dayOffs: DayOff[]
): TimeSlot[] {
  if (dayOffs.some((off) => off.date === date)) {
    return [];
  }

  const startMinutes = timeToMinutes(settings.startTime);
  const endMinutes = timeToMinutes(settings.endTime);
  const lunchStartMinutes = timeToMinutes(settings.lunchStart);
  const lunchEndMinutes = timeToMinutes(settings.lunchEnd);

  const dateAppointments = appointments.filter(
    (apt) => apt.date === date && apt.status === "CONFIRMED"
  );

  const slots: TimeSlot[] = [];
  let currentMinutes = startMinutes;

  while (currentMinutes + serviceDurationMinutes <= endMinutes) {
    const slotEnd = currentMinutes + serviceDurationMinutes;

    const overlapsLunch =
      currentMinutes < lunchEndMinutes && slotEnd > lunchStartMinutes;

    const overlapsAppointment = dateAppointments.some((apt) => {
      const aptStart = timeToMinutes(apt.startTime);
      const aptEnd = timeToMinutes(apt.endTime);
      return currentMinutes < aptEnd && slotEnd > aptStart;
    });

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const isPast =
      date === todayStr &&
      currentMinutes < now.getHours() * 60 + now.getMinutes();

    slots.push({
      time: minutesToTime(currentMinutes),
      available: !overlapsLunch && !overlapsAppointment && !isPast,
    });

    currentMinutes += settings.slotInterval;
  }

  return slots;
}
