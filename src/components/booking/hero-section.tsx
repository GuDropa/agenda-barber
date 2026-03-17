"use client";

import Image from "next/image";
import { brand } from "@/config/brand";

type HeroSectionProps = {
  name?: string;
  tagline?: string;
  logo?: string;
};

export function HeroSection(props: HeroSectionProps) {
  const currentBrand = {
    name: props.name ?? brand.name,
    tagline: props.tagline ?? brand.tagline,
    logo: props.logo ?? brand.logo,
  };

  return (
    <section className="relative px-6 pt-12 pb-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 mb-4">
        <Image
          src={currentBrand.logo}
          alt={currentBrand.name}
          width={80}
          height={80}
        />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">
        {currentBrand.name}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {currentBrand.tagline}
      </p>
    </section>
  );
}

