import { getCurrentBrand } from "@/lib/tenant";
import { AdminPageClient } from "@/components/admin/admin-page-client";
import { AdminGate } from "@/components/admin/admin-gate";

export default async function AdminPage() {
  const brand = await getCurrentBrand();
  return (
    <AdminGate brand={brand}>
      <AdminPageClient brand={brand} />
    </AdminGate>
  );
}
