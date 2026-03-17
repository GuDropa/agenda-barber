const AIRTABLE_API_URL = "https://api.airtable.com/v0";

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime?: string;
}

interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

/** baseIdOverride: quando passado (ex.: base do tenant), usa em vez do env. */
function getConfig(baseIdOverride?: string | null) {
  const token = process.env.AIRTABLE_API_TOKEN;
  const baseId = baseIdOverride ?? process.env.AIRTABLE_BASE_ID;

  if (!token || !baseId) return null;
  return { token, baseId };
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function isConfigured(): boolean {
  return getConfig() !== null;
}

export async function listRecords(
  table: string,
  options?: {
    filterByFormula?: string;
    sort?: { field: string; direction: "asc" | "desc" }[];
    maxRecords?: number;
  },
  baseIdOverride?: string | null
): Promise<AirtableRecord[] | null> {
  const config = getConfig(baseIdOverride);
  if (!config) return null;

  const params = new URLSearchParams();
  if (options?.filterByFormula) {
    params.set("filterByFormula", options.filterByFormula);
  }
  if (options?.sort) {
    options.sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction);
    });
  }
  if (options?.maxRecords) {
    params.set("maxRecords", String(options.maxRecords));
  }

  const url = `${AIRTABLE_API_URL}/${config.baseId}/${encodeURIComponent(table)}?${params}`;

  const response = await fetch(url, {
    headers: authHeaders(config.token),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`[Airtable] Erro ao listar ${table}:`, await response.text());
    return null;
  }

  const data = (await response.json()) as AirtableListResponse;
  return data.records;
}

export async function getRecord(
  table: string,
  recordId: string,
  baseIdOverride?: string | null
): Promise<AirtableRecord | null> {
  const config = getConfig(baseIdOverride);
  if (!config) return null;

  const url = `${AIRTABLE_API_URL}/${config.baseId}/${encodeURIComponent(table)}/${recordId}`;

  const response = await fetch(url, {
    headers: authHeaders(config.token),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error(`[Airtable] Erro ao buscar ${table}/${recordId}:`, await response.text());
    return null;
  }

  return (await response.json()) as AirtableRecord;
}

export async function createRecord(
  table: string,
  fields: Record<string, unknown>,
  baseIdOverride?: string | null
): Promise<AirtableRecord | null> {
  const config = getConfig(baseIdOverride);
  if (!config) return null;

  const url = `${AIRTABLE_API_URL}/${config.baseId}/${encodeURIComponent(table)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: authHeaders(config.token),
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    console.error(`[Airtable] Erro ao criar em ${table}:`, await response.text());
    return null;
  }

  return (await response.json()) as AirtableRecord;
}

export async function updateRecord(
  table: string,
  recordId: string,
  fields: Record<string, unknown>,
  baseIdOverride?: string | null
): Promise<AirtableRecord | null> {
  const config = getConfig(baseIdOverride);
  if (!config) return null;

  const url = `${AIRTABLE_API_URL}/${config.baseId}/${encodeURIComponent(table)}/${recordId}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: authHeaders(config.token),
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    console.error(`[Airtable] Erro ao atualizar ${table}/${recordId}:`, await response.text());
    return null;
  }

  return (await response.json()) as AirtableRecord;
}

export async function deleteRecord(
  table: string,
  recordId: string,
  baseIdOverride?: string | null
): Promise<boolean> {
  const config = getConfig(baseIdOverride);
  if (!config) return false;

  const url = `${AIRTABLE_API_URL}/${config.baseId}/${encodeURIComponent(table)}/${recordId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(config.token),
  });

  if (!response.ok) {
    console.error(`[Airtable] Erro ao deletar ${table}/${recordId}:`, await response.text());
    return false;
  }

  return true;
}
