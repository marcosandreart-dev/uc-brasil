import { NextResponse } from "next/server";
import { getTIByIdentifier } from "@/lib/tis";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const ti = getTIByIdentifier(params.slug);

  if (!ti) {
    return NextResponse.json({ code: "NOT_FOUND", message: "Terra indígena não encontrada" }, { status: 404 });
  }

  return NextResponse.json(ti, {
    headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400" },
  });
}
