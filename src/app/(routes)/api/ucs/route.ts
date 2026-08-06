import { NextRequest, NextResponse } from "next/server";
import { buscarUCs } from "@/lib/ucs";
import type { FiltrosBusca } from "@/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filtros: FiltrosBusca = {
    q: params.get("q") ?? undefined,
    esfera: params.get("esfera") ?? undefined,
    grupo: params.get("grupo") ?? undefined,
    categoria: params.get("categoria") ?? undefined,
    bioma: params.get("bioma") ?? undefined,
    uf: params.get("uf") ?? undefined,
    ordem: (params.get("ordem") as FiltrosBusca["ordem"]) ?? undefined,
    page: params.get("page") ? Number(params.get("page")) : undefined,
    per_page: params.get("per_page") ? Number(params.get("per_page")) : undefined,
  };

  const perPage = Math.min(Math.max(filtros.per_page ?? 20, 1), 100);

  const resultado = buscarUCs({ ...filtros, per_page: perPage });

  return NextResponse.json(resultado, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
