"use server";

import * as airtable from "@/lib/airtable";
import { getCurrentTenantBaseId } from "@/lib/tenant";
import { ScheduleSettings, DayOff } from "@/lib/types";
import { mockScheduleSettings, mockDayOffs } from "@/lib/mock-data";

// ============ SCHEDULE SETTINGS ============

function mapSettings(record: airtable.AirtableRecord): ScheduleSettings {
  const f = record.fields;
  return {
    id: record.id,
    startTime: (f.StartTime as string) || "09:00",
    endTime: (f.EndTime as string) || "20:00",
    lunchStart: (f.LunchStart as string) || "12:00",
    lunchEnd: (f.LunchEnd as string) || "13:00",
    slotInterval: (f.SlotInterval as number) || 30,
  };
}

export async function getScheduleSettings(): Promise<ScheduleSettings> {
  const baseId = await getCurrentTenantBaseId();
  const records = await airtable.listRecords(
    "Settings",
    { maxRecords: 1 },
    baseId
  );
  if (!records || records.length === 0) return mockScheduleSettings;
  return mapSettings(records[0]);
}

export async function updateScheduleSettings(
  data: ScheduleSettings
): Promise<ScheduleSettings | null> {
  const baseId = await getCurrentTenantBaseId();
  const fields = {
    StartTime: data.startTime,
    EndTime: data.endTime,
    LunchStart: data.lunchStart,
    LunchEnd: data.lunchEnd,
    SlotInterval: data.slotInterval,
  };

  if (data.id && data.id !== "settings-1") {
    const record = await airtable.updateRecord(
      "Settings",
      data.id,
      fields,
      baseId
    );
    if (!record) return null;
    return mapSettings(record);
  }

  const existing = await airtable.listRecords(
    "Settings",
    { maxRecords: 1 },
    baseId
  );
  if (existing && existing.length > 0) {
    const record = await airtable.updateRecord(
      "Settings",
      existing[0].id,
      fields,
      baseId
    );
    if (!record) return null;
    return mapSettings(record);
  }

  const record = await airtable.createRecord("Settings", fields, baseId);
  if (!record) return null;
  return mapSettings(record);
}

// ============ DAY OFFS ============

function mapDayOff(record: airtable.AirtableRecord): DayOff {
  const f = record.fields;
  return {
    id: record.id,
    date: (f.Date as string) || "",
    reason: (f.Reason as string) || undefined,
  };
}

export async function getDayOffs(): Promise<DayOff[]> {
  const baseId = await getCurrentTenantBaseId();
  const records = await airtable.listRecords(
    "DayOffs",
    { sort: [{ field: "Date", direction: "asc" }] },
    baseId
  );
  if (!records) return mockDayOffs;
  return records.map(mapDayOff);
}

export async function createDayOff(
  date: string,
  reason?: string
): Promise<DayOff | null> {
  const baseId = await getCurrentTenantBaseId();
  const record = await airtable.createRecord(
    "DayOffs",
    { Date: date, Reason: reason || "" },
    baseId
  );
  if (!record) return null;
  return mapDayOff(record);
}

export async function deleteDayOff(id: string): Promise<boolean> {
  const baseId = await getCurrentTenantBaseId();
  return airtable.deleteRecord("DayOffs", id, baseId);
}
