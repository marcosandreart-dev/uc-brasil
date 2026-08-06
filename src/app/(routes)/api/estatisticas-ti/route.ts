import { NextResponse } from "next/server";
import { getEstatisticasTI } from "@/lib/tis";

export async function GET() {
  const estatisticas = getEstatisticasTI();

  return NextResponse.json(estatisticas, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400" },
  });
}
