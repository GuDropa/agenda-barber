export const brand = {
  name: "Zé Barber",
  tagline: "Especialista em Cortes Modernos e Prótese Capilar",
  logo: "/logo_ze_barber.jpg",
  colors: {
    primary: "#c9a84c",
    primaryForeground: "#1a1a1a",
    secondary: "#2a2a2a",
    background: "#0d0d12",
    gold: "#d4a853",
  },
  contact: {
    phone: "(21) 99999-9999",
    address: "Rua Exemplo, 123 - Centro",
    instagram: "@barberpro",
  },
} as const;

export const evolutionApi = {
  baseUrl: process.env.NEXT_PUBLIC_EVOLUTION_API_URL || "http://localhost:8080",
  apiKey: process.env.EVOLUTION_API_KEY || "",
  instance: process.env.EVOLUTION_API_INSTANCE || "barberpro",
} as const;

export type Brand = {
  name: string;
  tagline: string;
  logo: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    background: string;
    gold: string;
  };
  contact: {
    phone: string;
    address: string;
    instagram: string;
  };
};
