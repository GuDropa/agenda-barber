export type AppointmentStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  serviceId: string;
  service?: Service;
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface ScheduleSettings {
  id: string;
  startTime: string;
  endTime: string;
  lunchStart: string;
  lunchEnd: string;
  slotInterval: number;
}

export interface DayOff {
  id: string;
  date: string;
  reason?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BookingData {
  service: Service;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
}

export type BookingStep = "service" | "datetime" | "confirm" | "success";
