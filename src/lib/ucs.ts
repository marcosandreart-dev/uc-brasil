import ucsData from "@/data/ucs.json";
import type {
  UnidadeConservacao,
  FiltrosBusca,
  ResultadoBusca,
  EstatisticasNacionais,
} from "@/types";

const ucs = ucsData as UnidadeConservacao[];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getUCByIdentifier(identifier: string): UnidadeConservacao | undefined {
  const id = normalize(identifier);
  return ucs.find((uc) => uc.id === identifier || uc.slug === identifier || normalize(uc.codigo) === id);
}

export function buscarUCs(filtros: FiltrosBusca = {}): ResultadoBusca {
  const { q, esfera, grupo, categoria, bioma, uf, page = 1, per_page = 20, ordem } = filtros;

  let resultado = ucs;

  if (q && q.trim() !== "") {
    const termo = normalize(q.trim());
    resultado = resultado.filter((uc) =>
      [
        uc.nome,
        uc.municipios,
        uc.orgao_gestor,
        uc.categoria,
        uc.codigo,
        uc.slug,
      ].some((campo) => normalize(campo).includes(termo))
    );
  }

  if (esfera) resultado = resultado.filter((uc) => uc.esfera === esfera);
  if (grupo) resultado = resultado.filter((uc) => uc.grupo === grupo);
  if (categoria) resultado = resultado.filter((uc) => uc.categoria === categoria);
  if (bioma) resultado = resultado.filter((uc) => uc.bioma === bioma);
  if (uf) resultado = resultado.filter((uc) => uc.uf === uf);

  const ordenado = [...resultado];
  if (ordem === "area") {
    ordenado.sort((a, b) => (b.area_ha ?? 0) - (a.area_ha ?? 0));
  } else if (ordem === "ano") {
    ordenado.sort((a, b) => (b.ano_criacao ?? 0) - (a.ano_criacao ?? 0));
  } else {
    ordenado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }

  const total = ordenado.length;
  const totalPages = Math.max(1, Math.ceil(total / per_page));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const inicio = (safePage - 1) * per_page;

  return {
    ucs: ordenado.slice(inicio, inicio + per_page),
    total,
    page: safePage,
    per_page,
    total_pages: totalPages,
  };
}

export function listarSlugs(): { slug: string }[] {
  return ucs.map((uc) => ({ slug: uc.slug }));
}

export function listarOpcoes() {
  const stats = getEstatisticas();
  const ordenar = (a: string, b: string) => a.localeCompare(b, "pt-BR");
  return {
    categorias: Object.keys(stats.por_categoria).sort(ordenar),
    biomas: Object.keys(stats.por_bioma).sort(ordenar),
    ufs: Object.keys(stats.por_uf).sort(ordenar),
  };
}

export function getEstatisticas(): EstatisticasNacionais {
  const contar = (campo: keyof UnidadeConservacao): Record<string, number> => {
    const mapa: Record<string, number> = {};
    for (const uc of ucs) {
      const valor = String(uc[campo] ?? "Não informado");
      mapa[valor] = (mapa[valor] ?? 0) + 1;
    }
    return mapa;
  };

  const porEsfera = contar("esfera");
  const areaTotal = ucs.reduce((soma, uc) => soma + (uc.area_ha ?? 0), 0);

  return {
    total_ucs: ucs.length,
    total_federal: porEsfera.Federal ?? 0,
    total_estadual: porEsfera.Estadual ?? 0,
    total_municipal: porEsfera.Municipal ?? 0,
    area_total_ha: areaTotal,
    por_esfera: porEsfera,
    por_grupo: contar("grupo"),
    por_categoria: contar("categoria"),
    por_bioma: contar("bioma"),
    por_uf: contar("uf"),
  };
}
