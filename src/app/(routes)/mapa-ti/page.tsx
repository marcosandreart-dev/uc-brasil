import type { Metadata } from "next";
import dynamic from "next/dynamic";

const MapViewTI = dynamic(() => import("./MapViewTI"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
      <p className="text-sm text-gray-500">Carregando mapa…</p>
    </div>
  ),
});

export const metadata: Metadata = {
  title: "Mapa das Terras Indígenas | UC Brasil",
  description:
    "Mapa interativo com os polígonos das Terras Indígenas do Brasil, com dados da Coordenação-Geral de Geoprocessamento (CGGEO) da FUNAI.",
  openGraph: {
    title: "Mapa das Terras Indígenas | UC Brasil",
    description:
      "Mapa interativo com os polígonos das Terras Indígenas do Brasil (FUNAI).",
  },
};

export default function MapaTIPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Mapa das Terras Indígenas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Clique em uma área para ver o nome e acessar a ficha da terra indígena.
          Polígonos oficiais da FUNAI (atualização mensal).
        </p>
      </div>
      <MapViewTI />
      <p className="mt-3 text-xs text-gray-400">
        Fonte: Coordenação-Geral de Geoprocessamento (CGGEO/FUNAI) ·
        Basemap: CARTO. Áreas aproximadas.
      </p>
    </main>
  );
}
