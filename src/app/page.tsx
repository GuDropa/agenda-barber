import { getCurrentBrand } from "@/lib/tenant";
import { HomePageClient } from "@/components/booking/home-page-client";

export default async function HomePage() {
  const brand = await getCurrentBrand();
  return <HomePageClient brand={brand} />;
}

