"use server";

import * as airtable from "@/lib/airtable";
import { getCurrentTenantBaseId } from "@/lib/tenant";
import { Service } from "@/lib/types";
import { mockServices } from "@/lib/mock-data";

function mapRecord(record: airtable.AirtableRecord): Service {
  const f = record.fields;
  return {
    id: record.id,
    name: (f.Name as string) || "",
    description: (f.Description as string) || undefined,
    price: (f.Price as number) || 0,
    durationMinutes: (f.DurationMinutes as number) || 30,
    active: (f.Active as boolean) ?? true,
  };
}

export async function getServices(): Promise<Service[]> {
  const baseId = await getCurrentTenantBaseId();
  const records = await airtable.listRecords(
    "Services",
    { sort: [{ field: "Name", direction: "asc" }] },
    baseId
  );
  if (!records) return mockServices;
  return records.map(mapRecord);
}

export async function createService(
  data: Omit<Service, "id" | "active">
): Promise<Service | null> {
  const baseId = await getCurrentTenantBaseId();
  const record = await airtable.createRecord(
    "Services",
    {
      Name: data.name,
      Description: data.description || "",
      Price: data.price,
      DurationMinutes: data.durationMinutes,
      Active: true,
    },
    baseId
  );
  if (!record) return null;
  return mapRecord(record);
}

export async function updateService(
  id: string,
  data: Partial<Service>
): Promise<Service | null> {
  const baseId = await getCurrentTenantBaseId();
  const fields: Record<string, unknown> = {};
  if (data.name !== undefined) fields.Name = data.name;
  if (data.description !== undefined) fields.Description = data.description;
  if (data.price !== undefined) fields.Price = data.price;
  if (data.durationMinutes !== undefined) fields.DurationMinutes = data.durationMinutes;
  if (data.active !== undefined) fields.Active = data.active;

  const record = await airtable.updateRecord("Services", id, fields, baseId);
  if (!record) return null;
  return mapRecord(record);
}

export async function deleteService(id: string): Promise<boolean> {
  const baseId = await getCurrentTenantBaseId();
  return airtable.deleteRecord("Services", id, baseId);
}
