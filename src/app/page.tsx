import Link from "next/link";
import { Leaf, Search, Landmark, Building2, TreePine } from "lucide-react";
import { getEstatisticas } from "@/lib/ucs";
import { formatArea } from "@/lib/utils";

export const revalidate = 86400;

export default function HomePage() {
  const stats = getEstatisticas();

  const topBiomas = Object.entries(stats.por_bioma)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topUFs = Object.entries(stats.por_uf)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const cards = [
    { rotulo: "Total de UCs", valor: stats.total_ucs.toLocaleString("pt-BR"), icone: Leaf },
    { rotulo: "Federais", valor: stats.total_federal.toLocaleString("pt-BR"), icone: Landmark },
    { rotulo: "Estaduais", valor: stats.total_estadual.toLocaleString("pt-BR"), icone: Building2 },
    { rotulo: "Municipais", valor: stats.total_municipal.toLocaleString("pt-BR"), icone: TreePine },
  ];

  return (
    <div>
      <section className="bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-16 text-center sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Unidades de Conservação do Brasil
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Catálogo informativo com dados oficiais do CNUC sobre{" "}
            <strong>{stats.total_ucs.toLocaleString("pt-BR")}</strong> unidades de
            conservação — federais, estaduais e municipais.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              <Search aria-hidden className="h-5 w-5" />
              Buscar UCs
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Estatísticas nacionais" className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.rotulo} className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
              <card.icone aria-hidden className="mx-auto h-8 w-8 text-primary-600" />
              <p className="mt-3 text-3xl font-bold text-gray-900">{card.valor}</p>
              <p className="mt-1 text-sm font-medium text-gray-500">{card.rotulo}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-500">Área protegida total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatArea(stats.area_total_ha)}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section aria-label="UCs por bioma" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Por bioma</h2>
            <ul className="mt-4 space-y-3">
              {topBiomas.map(([bioma, total]) => (
                <li key={bioma} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{bioma}</span>
                  <span className="font-semibold text-gray-900">{total.toLocaleString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="UCs por estado" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Por estado</h2>
            <ul className="mt-4 space-y-3">
              {topUFs.map(([uf, total]) => (
                <li key={uf} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{uf}</span>
                  <span className="font-semibold text-gray-900">{total.toLocaleString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
