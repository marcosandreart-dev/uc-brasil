import { NextRequest, NextResponse } from "next/server";
import { buscarTIs } from "@/lib/tis";
import type { FiltrosBuscaTI } from "@/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filtros: FiltrosBuscaTI = {
    q: params.get("q") ?? undefined,
    situacao: params.get("situacao") ?? undefined,
    modalidade: params.get("modalidade") ?? undefined,
    uf: params.get("uf") ?? undefined,
    ordem: (params.get("ordem") as FiltrosBuscaTI["ordem"]) ?? undefined,
    page: params.get("page") ? Number(params.get("page")) : undefined,
    per_page: params.get("per_page") ? Number(params.get("per_page")) : undefined,
  };

  const perPage = Math.min(Math.max(filtros.per_page ?? 20, 1), 100);

  const resultado = buscarTIs({ ...filtros, per_page: perPage });

  return NextResponse.json(resultado, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
