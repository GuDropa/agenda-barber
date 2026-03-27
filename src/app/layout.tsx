import type { Metadata, Viewport } from "next";
import type React from "react";
import { Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { getCurrentBrand } from "@/lib/tenant";

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

  return (
    <html
      lang="pt-BR"
      className={montserrat.variable}
      style={
        {
          "--primary": brand.colors.primary,
          "--primary-foreground": brand.colors.primaryForeground,
          "--secondary": brand.colors.secondary,
          "--background": brand.colors.background,
          "--card": brand.colors.secondary,
          "--popover": brand.colors.secondary,
          "--ring": brand.colors.primary,
          "--gold": brand.colors.gold,
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
