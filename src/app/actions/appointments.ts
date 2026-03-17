"use server";

import * as airtable from "@/lib/airtable";
import { getCurrentTenantBaseId } from "@/lib/tenant";
import { Appointment } from "@/lib/types";
import { mockAppointments } from "@/lib/mock-data";
import { format, addDays } from "date-fns";

function mapRecord(record: airtable.AirtableRecord): Appointment {
  const f = record.fields;
  return {
    id: record.id,
    serviceId: (f.ServiceId as string) || "",
    service: {
      id: (f.ServiceId as string) || "",
      name: (f.ServiceName as string) || "",
      price: (f.ServicePrice as number) || 0,
      durationMinutes: (f.ServiceDuration as number) || 30,
      active: true,
    },
    clientName: (f.ClientName as string) || "",
    clientPhone: (f.ClientPhone as string) || "",
    date: (f.Date as string) || "",
    startTime: (f.StartTime as string) || "",
    endTime: (f.EndTime as string) || "",
    status: ((f.Status as string) || "CONFIRMED") as Appointment["status"],
    createdAt: record.createdTime || new Date().toISOString(),
  };
}

export async function getAppointments(
  daysAhead: number = 30
): Promise<Appointment[]> {
  const baseId = await getCurrentTenantBaseId();
  const today = format(new Date(), "yyyy-MM-dd");
  const futureDate = format(addDays(new Date(), daysAhead), "yyyy-MM-dd");

  const records = await airtable.listRecords(
    "Appointments",
    {
      filterByFormula: `AND({Date} >= '${today}', {Date} <= '${futureDate}')`,
      sort: [
        { field: "Date", direction: "asc" },
        { field: "StartTime", direction: "asc" },
      ],
    },
    baseId
  );

  if (!records) return mockAppointments;
  return records.map(mapRecord);
}

export async function createAppointment(data: {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
}): Promise<Appointment | null> {
  const baseId = await getCurrentTenantBaseId();
  const record = await airtable.createRecord(
    "Appointments",
    {
      ServiceId: data.serviceId,
      ServiceName: data.serviceName,
      ServicePrice: data.servicePrice,
      ServiceDuration: data.serviceDuration,
      ClientName: data.clientName,
      ClientPhone: data.clientPhone,
      Date: data.date,
      StartTime: data.startTime,
      EndTime: data.endTime,
      Status: "CONFIRMED",
    },
    baseId
  );

  if (!record) return null;
  return mapRecord(record);
}

export async function cancelAppointment(id: string): Promise<boolean> {
  const baseId = await getCurrentTenantBaseId();
  const record = await airtable.updateRecord(
    "Appointments",
    id,
    { Status: "CANCELLED" },
    baseId
  );
  return record !== null;
}
