"use client";

import { brand } from "@/config/brand";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative px-6 pt-12 pb-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 mb-4">
        <Image src={brand.logo} alt={brand.name} width={80} height={80} />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{brand.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{brand.tagline}</p>
    </section>
  );
}
