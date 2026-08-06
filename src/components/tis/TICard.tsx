import Link from "next/link";
import { MapPin } from "lucide-react";
import type { TerraIndigena } from "@/types";
import { formatArea } from "@/lib/utils";

interface TICardProps {
  ti: TerraIndigena;
}

export function TICard({ ti }: TICardProps) {
  return (
    <Link
      href={`/terras-indigenas/${ti.slug}`}
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug text-gray-900">
          {ti.nome}
        </h3>
        <span className="shrink-0 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
          {ti.uf}
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-500">
        {ti.situacao} · {ti.modalidade}
      </p>

      <div className="mt-auto flex items-center justify-between pt-4 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1">
          <MapPin aria-hidden className="h-4 w-4" />
          {ti.municipios}
        </span>
        {ti.area_ha !== null && (
          <span className="font-medium text-gray-600">{formatArea(ti.area_ha)}</span>
        )}
      </div>
    </Link>
  );
}
