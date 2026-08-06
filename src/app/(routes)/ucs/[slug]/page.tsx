import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { getUCByIdentifier, listarSlugs } from "@/lib/ucs";
import { formatArea } from "@/lib/utils";
import type { UnidadeConservacao } from "@/types";

export const revalidate = 86400;

export function generateStaticParams() {
  return listarSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const uc = getUCByIdentifier(params.slug);
  if (!uc) return {};

  return {
    title: uc.nome,
    description: `${uc.categoria} — ${uc.esfera} · ${uc.uf}. Unidade de Conservação cadastrada no CNUC.`,
    openGraph: {
      title: uc.nome,
      description: `${uc.categoria} — ${uc.esfera} · ${uc.uf}.`,
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

export default function UCDetalhe({ params }: { params: { slug: string } }) {
  const uc = getUCByIdentifier(params.slug);
  if (!uc) notFound();

  const campos: Array<{ rotulo: string; valor: string }> = [];
  const adicionar = (rotulo: string, valor: string | number | null) => {
    if (valor === null || valor === undefined || String(valor).trim() === "") return;
    campos.push({ rotulo, valor: String(valor) });
  };

  adicionar("Categoria de manejo", uc.categoria);
  adicionar("Categoria IUCN", uc.categoria_iuuc);
  adicionar("Grupo", uc.grupo);
  adicionar("Esfera administrativa", uc.esfera);
  adicionar("Estado (UF)", uc.uf);
  adicionar("Bioma", uc.bioma);
  adicionar("Municípios abrangidos", uc.municipios);
  adicionar("Órgão gestor", uc.orgao_gestor);
  adicionar("Área", formatArea(uc.area_ha));
  adicionar("Ano de criação", uc.ano_criacao);
  adicionar("Ato legal de criação", uc.ato_legal);
  adicionar("Plano de manejo", uc.plano_manejo);
  adicionar("Conselho gestor", uc.conselho_gestor);
  adicionar("Código WDPA", uc.codigo_wdpa);

  return (
    <article className="container mx-auto max-w-4xl px-4 py-10">
      <nav aria-label="Trilha" className="mb-6 text-sm text-gray-500">
        <Link href="/buscar" className="inline-flex items-center gap-1 transition-colors hover:text-primary-700">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Voltar para a busca
        </Link>
      </nav>

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge>{uc.esfera}</Badge>
          <Badge>{uc.grupo}</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {uc.nome}
        </h1>
        <p className="mt-3 flex items-center gap-1.5 text-gray-600">
          <MapPin aria-hidden className="h-5 w-5 text-primary-600" />
          {uc.uf} — {uc.bioma}
        </p>
      </header>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campos.map((campo) => (
          <Campo key={campo.rotulo} rotulo={campo.rotulo} valor={campo.valor} />
        ))}
      </dl>

      <footer className="mt-8 text-sm text-gray-500">
        Dados obtidos do Cadastro Nacional de Unidades de Conservação (CNUC) —{" "}
        <a
          href="https://dados.mma.gov.br/dataset/unidadesdeconservacao"
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
