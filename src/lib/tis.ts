import tisData from "@/data/tis.json";
import type {
  TerraIndigena,
  FiltrosBuscaTI,
  ResultadoBuscaTI,
  EstatisticasTI,
} from "@/types";

const tis = tisData as TerraIndigena[];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getTIByIdentifier(identifier: string): TerraIndigena | undefined {
  const id = normalize(identifier);
  return tis.find(
    (ti) =>
      ti.id === identifier ||
      ti.codigo === identifier ||
      ti.slug === identifier ||
      normalize(ti.nome) === id
  );
}

export function buscarTIs(filtros: FiltrosBuscaTI = {}): ResultadoBuscaTI {
  const { q, situacao, modalidade, uf, page = 1, per_page = 20, ordem } = filtros;

  let resultado = tis;

  if (q && q.trim() !== "") {
    const termo = normalize(q.trim());
    resultado = resultado.filter((ti) =>
      [ti.nome, ti.etnias, ti.municipios, ti.cr, ti.codigo, ti.slug].some((campo) =>
        normalize(campo).includes(termo)
      )
    );
  }

  if (situacao) resultado = resultado.filter((ti) => ti.situacao === situacao);
  if (modalidade) resultado = resultado.filter((ti) => ti.modalidade === modalidade);
  if (uf) resultado = resultado.filter((ti) => ti.uf === uf);

  const ordenado = [...resultado];
  if (ordem === "area") {
    ordenado.sort((a, b) => (b.area_ha ?? 0) - (a.area_ha ?? 0));
  } else {
    ordenado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  const total = ordenado.length;
  const totalPages = Math.max(1, Math.ceil(total / per_page));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const inicio = (safePage - 1) * per_page;

  return {
    tis: ordenado.slice(inicio, inicio + per_page),
    total,
    page: safePage,
    per_page,
    total_pages: totalPages,
  };
}

export function listarSlugsTI(): { slug: string }[] {
  return tis.map((ti) => ({ slug: ti.slug }));
}

export function listarOpcoesTI() {
  const stats = getEstatisticasTI();
  const ordenar = (a: string, b: string) => a.localeCompare(b, "pt-BR");
  return {
    situacoes: Object.keys(stats.por_situacao).sort(ordenar),
    modalidades: Object.keys(stats.por_modalidade).sort(ordenar),
    ufs: Object.keys(stats.por_uf).sort(ordenar),
  };
}

export function getEstatisticasTI(): EstatisticasTI {
  const contar = (campo: keyof TerraIndigena): Record<string, number> => {
    const mapa: Record<string, number> = {};
    for (const ti of tis) {
      const valor = String(ti[campo] ?? "Não informado");
      mapa[valor] = (mapa[valor] ?? 0) + 1;
    }
    return mapa;
  };

  const areaTotal = tis.reduce((soma, ti) => soma + (ti.area_ha ?? 0), 0);

  return {
    total_tis: tis.length,
    area_total_ha: areaTotal,
    por_situacao: contar("situacao"),
    por_modalidade: contar("modalidade"),
    por_uf: contar("uf"),
  };
}
