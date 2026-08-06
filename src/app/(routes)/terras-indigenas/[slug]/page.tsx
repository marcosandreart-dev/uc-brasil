import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { getTIByIdentifier, listarSlugsTI } from "@/lib/tis";
import { formatArea } from "@/lib/utils";
import type { TerraIndigena } from "@/types";

export const revalidate = 86400;

export function generateStaticParams() {
  return listarSlugsTI();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const ti = getTIByIdentifier(params.slug);
  if (!ti) return {};

  return {
    title: ti.nome,
    description: `Terra Indígena ${ti.nome} — ${ti.situacao} · ${ti.uf}. Dados oficiais da FUNAI.`,
    openGraph: {
      title: ti.nome,
      description: `Terra Indígena ${ti.nome} — ${ti.situacao} · ${ti.uf}.`,
      type: "website",
      locale: "pt_BR",
    },
  };
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {rotulo}
      </dt>
      <dd className="mt-1 text-base font-medium text-gray-900">{valor}</dd>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
      {children}
    </span>
  );
}

export default function TIDetalhe({ params }: { params: { slug: string } }) {
  const ti = getTIByIdentifier(params.slug);
  if (!ti) notFound();

  const dominioUniao = (valor: string): string => {
    const v = valor.trim().toLowerCase();
    if (v === "t") return "Sim";
    if (v === "f") return "Não";
    return valor;
  };

  const campos: Array<{ rotulo: string; valor: string }> = [];
  const adicionar = (rotulo: string, valor: string | number | null) => {
    if (valor === null || valor === undefined || String(valor).trim() === "") return;
    campos.push({ rotulo, valor: String(valor) });
  };

  adicionar("Situação demarcatória", ti.situacao);
  adicionar("Modalidade", ti.modalidade);
  adicionar("Povos/etnias", ti.etnias);
  adicionar("Município", ti.municipios);
  adicionar("Estado (UF)", ti.uf);
  adicionar("Área", formatArea(ti.area_ha));
  adicionar("Coordenação Regional", ti.cr);
  adicionar("Faixa de fronteira", ti.faixa_fronteira);
  adicionar("Domínio da União", dominioUniao(ti.dominio_uniao));
  adicionar("Data de atualização", ti.data_atualizacao);

  return (
    <article className="container mx-auto max-w-4xl px-4 py-10">
      <nav aria-label="Trilha" className="mb-6 text-sm text-gray-500">
        <Link href="/terras-indigenas" className="inline-flex items-center gap-1 transition-colors hover:text-primary-700">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Voltar para Terras Indígenas
        </Link>
      </nav>

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge>{ti.situacao}</Badge>
          <Badge>{ti.uf}</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Terra Indígena {ti.nome}
        </h1>
        <p className="mt-3 flex items-center gap-1.5 text-gray-600">
          <MapPin aria-hidden className="h-5 w-5 text-primary-600" />
          {ti.municipios} — {ti.uf}
        </p>
      </header>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campos.map((campo) => (
          <Campo key={campo.rotulo} rotulo={campo.rotulo} valor={campo.valor} />
        ))}
      </dl>

      <footer className="mt-8 text-sm text-gray-500">
        Dados obtidos da Coordenação-Geral de Geoprocessamento (CGGEO) da FUNAI —{" "}
        <a
          href="https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-700 underline-offset-2 hover:underline"
        >
          fonte oficial
        </a>
        .
      </footer>
    </article>
  );
}
