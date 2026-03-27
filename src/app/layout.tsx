import type { Metadata, Viewport } from "next";
import type React from "react";
import { Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { getCurrentBrand } from "@/lib/tenant";
import { borderMixFromBrand, mutedSurfaceFromBrand } from "@/lib/utils";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Barber Pro - Agendamento Online",
  description:
    "Agende seu horário na barbearia de forma rápida e prática. Escolha o serviço, dia e horário que preferir.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d0d14",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brand = await getCurrentBrand();
  const { foreground: fg, background: bg } = brand.colors;

  return (
    <html
      lang="pt-BR"
      className={montserrat.variable}
      style={
        {
          "--primary": brand.colors.primary,
          "--primary-foreground": brand.colors.primaryForeground,
          "--secondary": brand.colors.secondary,
          "--background": bg,
          "--foreground": fg,
          "--muted-foreground": brand.colors.mutedForeground,
          "--card": brand.colors.secondary,
          "--popover": brand.colors.secondary,
          "--card-foreground": fg,
          "--popover-foreground": fg,
          "--secondary-foreground": fg,
          "--accent": mutedSurfaceFromBrand(bg, brand.colors.primary),
          "--accent-foreground": fg,
          "--border": borderMixFromBrand(fg, bg),
          "--input": borderMixFromBrand(fg, bg),
          "--ring": brand.colors.primary,
          "--gold": brand.colors.gold,
          "--muted": mutedSurfaceFromBrand(bg, brand.colors.primary),
        } as React.CSSProperties
      }
    >
      <body className="antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
