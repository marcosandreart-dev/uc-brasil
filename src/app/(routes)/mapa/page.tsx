import type { Metadata } from "next";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
      <p className="text-sm text-gray-500">Carregando mapa…</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Mapa das Unidades de Conservação | UC Brasil",
  description:
    "Mapa interativo com os polígonos das Unidades de Conservação do Brasil, com dados do Cadastro Nacional de Unidades de Conservação (CNUC).",
  openGraph: {
    title: "Mapa das Unidades de Conservação | UC Brasil",
    description:
      "Mapa interativo com os polígonos das Unidades de Conservação do Brasil (CNUC).",
  },
};

export default function MapaPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Mapa das Unidades de Conservação
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Clique em uma área para ver o nome e acessar a ficha da unidade.
          Polígonos oficiais do CNUC (atualização 2025/08).
        </p>
      </div>
      <MapView />
      <p className="mt-3 text-xs text-gray-400">
        Fonte: Cadastro Nacional de Unidades de Conservação (CNUC/MMA) ·
        Basemap: CARTO. Áreas aproximadas.
      </p>
    </main>
  );
}
