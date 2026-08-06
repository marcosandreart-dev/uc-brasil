"use client";

import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { TICard } from "@/components/tis/TICard";
import type { ResultadoBuscaTI } from "@/types";

interface OpcoesTI {
  situacoes: string[];
  modalidades: string[];
  ufs: string[];
}

interface TIBuscaClienteProps {
  opcoes: OpcoesTI;
}

const PER_PAGE = 20;

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500";

export function TIBuscaCliente({ opcoes }: TIBuscaClienteProps) {
  const [termo, setTermo] = useState("");
  const [situacao, setSituacao] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [uf, setUf] = useState("");
  const [page, setPage] = useState(1);

  const termoFiltrado = useDeferredValue(termo.trim());

  const { data, isLoading, isError, isFetching } = useQuery<ResultadoBuscaTI>({
    queryKey: ["busca-ti", termoFiltrado, situacao, modalidade, uf, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (termoFiltrado) params.set("q", termoFiltrado);
      if (situacao) params.set("situacao", situacao);
      if (modalidade) params.set("modalidade", modalidade);
      if (uf) params.set("uf", uf);
      params.set("page", String(page));
      params.set("per_page", String(PER_PAGE));

      const response = await fetch(`/api/tis?${params.toString()}`);
      if (!response.ok) throw new Error("Falha ao buscar Terras Indígenas");
      return response.json();
    },
    placeholderData: (prev) => prev,
  });

  const aplicarFiltro = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Terras Indígenas
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Busque e filtre as Terras Indígenas do Brasil. Dados oficiais da FUNAI (CGGEO).
      </p>

      <form
        className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
        }}
      >
        <div className="relative">
          <label htmlFor="q" className="sr-only">
            Termo de busca
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            id="q"
            type="search"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Busque por nome, etnia, município ou coordenação regional..."
            className={`${inputCls} pl-10`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <label htmlFor="situacao" className="sr-only">
              Situação demarcatória
            </label>
            <select id="situacao" value={situacao} onChange={aplicarFiltro(setSituacao)} className={inputCls}>
              <option value="">Situação demarcatória</option>
              {opcoes.situacoes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="modalidade" className="sr-only">
              Modalidade
            </label>
            <select id="modalidade" value={modalidade} onChange={aplicarFiltro(setModalidade)} className={inputCls}>
              <option value="">Modalidade</option>
              {opcoes.modalidades.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="uf" className="sr-only">
              Estado
            </label>
            <select id="uf" value={uf} onChange={aplicarFiltro(setUf)} className={inputCls}>
              <option value="">Estado</option>
              {opcoes.ufs.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <div aria-live="polite" className="mt-6">
        {isError && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Não foi possível carregar os resultados. Tente novamente.
          </p>
        )}

        {!isError && data && data.total === 0 && !isFetching && (
          <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Nenhuma Terra Indígena encontrada com esses filtros.
          </p>
        )}

        {(isLoading || (isFetching && !data)) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
            ))}
          </div>
        )}

        {data && data.tis.length > 0 && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {data.total.toLocaleString("pt-BR")} terra(s) indígena(s) encontrada(s)
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.tis.map((ti) => (
                <TICard key={ti.id} ti={ti} />
              ))}
            </div>

            {data.total_pages > 1 && (
              <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page <= 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {data.page} de {data.total_pages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={data.page >= data.total_pages}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Próxima
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
