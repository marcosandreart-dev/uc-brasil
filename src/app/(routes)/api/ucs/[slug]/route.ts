import { NextResponse } from "next/server";
import { getUCByIdentifier } from "@/lib/ucs";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const uc = getUCByIdentifier(params.slug);

  if (!uc) {
    return NextResponse.json({ code: "NOT_FOUND", message: "UC não encontrada" }, { status: 404 });
  }

  return NextResponse.json(uc, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400" },
  });
}
