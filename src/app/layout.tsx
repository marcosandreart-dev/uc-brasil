import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "UC Brasil — Maior Catálogo Digital de Unidades de Conservação",
    template: "%s | UC Brasil",
  },
  description:
    "Plataforma que reúne informações oficiais sobre todas as Unidades de Conservação do Brasil — federais, estaduais e municipais.",
  keywords: [
    "unidades de conservação",
    "UC Brasil",
    "ICMBio",
    "CNUC",
    "IBGE",
    "conservação ambiental",
    "brasil",
    "biodiversidade",
  ],
  authors: [{ name: "UC Brasil" }],
  openGraph: {
    title: "UC Brasil",
    description:
      "Maior catálogo digital de Unidades de Conservação do Brasil",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "UC Brasil",
    description:
      "Maior catálogo digital de Unidades de Conservação do Brasil",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col bg-white text-gray-900">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
