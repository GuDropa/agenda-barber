import { Service, Appointment, ScheduleSettings, DayOff } from "./types";
import { format, addDays } from "date-fns";

export const mockServices: Service[] = [
  {
    id: "svc-1",
    name: "Corte Degradê",
    description: "Corte moderno com degradê perfeito",
    price: 45,
    durationMinutes: 45,
    active: true,
  },
  {
    id: "svc-2",
    name: "Barba Completa",
    description: "Barba com navalha e toalha quente",
    price: 35,
    durationMinutes: 30,
    active: true,
  },
  {
    id: "svc-3",
    name: "Corte + Barba",
    description: "Combo completo: corte e barba",
    price: 70,
    durationMinutes: 75,
    active: true,
  },
  {
    id: "svc-4",
    name: "Corte Infantil",
    description: "Corte para crianças até 12 anos",
    price: 30,
    durationMinutes: 30,
    active: true,
  },
  {
    id: "svc-5",
    name: "Sobrancelha",
    description: "Design de sobrancelha masculina",
    price: 15,
    durationMinutes: 15,
    active: true,
  },
  {
    id: "svc-6",
    name: "Pigmentação",
    description: "Pigmentação capilar temporária",
    price: 80,
    durationMinutes: 60,
    active: true,
  },
];

const today = format(new Date(), "yyyy-MM-dd");
const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

export const mockAppointments: Appointment[] = [
  {
    id: "apt-1",
    serviceId: "svc-1",
    service: mockServices[0],
    clientName: "João Silva",
    clientPhone: "(11) 98765-4321",
    date: today,
    startTime: "09:00",
    endTime: "09:45",
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "apt-2",
    serviceId: "svc-3",
    service: mockServices[2],
    clientName: "Carlos Oliveira",
    clientPhone: "(11) 91234-5678",
    date: today,
    startTime: "10:00",
    endTime: "11:15",
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "apt-3",
    serviceId: "svc-2",
    service: mockServices[1],
    clientName: "Pedro Santos",
    clientPhone: "(11) 99876-5432",
    date: today,
    startTime: "14:00",
    endTime: "14:30",
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "apt-4",
    serviceId: "svc-1",
    service: mockServices[0],
    clientName: "Lucas Mendes",
    clientPhone: "(11) 97654-3210",
    date: tomorrow,
    startTime: "09:00",
    endTime: "09:45",
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  },
];

export const mockScheduleSettings: ScheduleSettings = {
  id: "settings-1",
  startTime: "09:00",
  endTime: "20:00",
  lunchStart: "12:00",
  lunchEnd: "13:00",
  slotInterval: 30,
};

export const mockDayOffs: DayOff[] = [
  {
    id: "off-1",
    date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
    reason: "Feriado",
  },
  {
    id: "off-2",
    date: format(addDays(new Date(), 14), "yyyy-MM-dd"),
    reason: "Dia pessoal",
  },
];
