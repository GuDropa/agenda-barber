import { getCurrentBrand } from "@/lib/tenant";
import { AdminPageClient } from "@/components/admin/admin-page-client";

export default async function AdminPage() {
  const brand = await getCurrentBrand();
  return <AdminPageClient brand={brand} />;
}

