import { NextResponse } from "next/server";
import { getEstatisticas } from "@/lib/ucs";

export async function GET() {
  const estatisticas = getEstatisticas();

  return NextResponse.json(estatisticas, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400" },
  });
}
