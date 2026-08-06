// ============================================
// UC Brasil — Tipos TypeScript
// Baseados no dataset real do CNUC (dados.mma.gov.br)
// ============================================

export type Esfera = "Federal" | "Estadual" | "Municipal";
export type Grupo = "Proteção Integral" | "Uso Sustentável";

export interface UnidadeConservacao {
  id: string;
  codigo: string;
  nome: string;
  slug: string;
  esfera: Esfera;
  categoria: string;
  categoria_iuuc: string;
  uf: string;
  ano_criacao: number | null;
  ato_legal: string;
  municipios: string;
  plano_manejo: string;
  conselho_gestor: string;
  orgao_gestor: string;
  area_ha: number | null;
  bioma: string;
  grupo: Grupo;
  codigo_wdpa: string;
}

export interface EstatisticasNacionais {
  total_ucs: number;
  total_federal: number;
  total_estadual: number;
  total_municipal: number;
  area_total_ha: number;
  por_esfera: Record<string, number>;
  por_grupo: Record<string, number>;
  por_categoria: Record<string, number>;
  por_bioma: Record<string, number>;
  por_uf: Record<string, number>;
}

export interface FiltrosBusca {
  q?: string;
  esfera?: string;
  grupo?: string;
  categoria?: string;
  bioma?: string;
  uf?: string;
  page?: number;
  per_page?: number;
  ordem?: "nome" | "area" | "ano";
}

export interface ResultadoBusca {
  ucs: UnidadeConservacao[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  code: string;
  message: string;
}

// ============================================
// Terras Indígenas (dados FUNAI — CGGEO)
// ============================================

export interface TerraIndigena {
  id: string;
  codigo: string;
  nome: string;
  slug: string;
  etnias: string;
  municipios: string;
  uf: string;
  area_ha: number | null;
  situacao: string;
  modalidade: string;
  cr: string;
  faixa_fronteira: string;
  dominio_uniao: string;
  data_atualizacao: string;
}

export interface EstatisticasTI {
  total_tis: number;
  area_total_ha: number;
  por_situacao: Record<string, number>;
  por_modalidade: Record<string, number>;
  por_uf: Record<string, number>;
}

export interface FiltrosBuscaTI {
  q?: string;
  situacao?: string;
  modalidade?: string;
  uf?: string;
  page?: number;
  per_page?: number;
  ordem?: "nome" | "area";
}

export interface ResultadoBuscaTI {
  tis: TerraIndigena[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
