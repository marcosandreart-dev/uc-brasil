"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const GEOJSON_URL = "/ucs_poligonos.geojson";
const BASEMAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

type Status = "carregando" | "pronto" | "erro";

function escapar(texto: string | null | undefined): string {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c;
  });
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [status, setStatus] = useState<Status>("carregando");

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = new maplibregl.Map({
      container,
      style: BASEMAP_STYLE,
      center: [-52, -14],
      zoom: 3.5,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    const handleError = () => setStatus("erro");
    map.on("error", handleError);

    map.on("load", async () => {
      try {
        const res = await fetch(GEOJSON_URL);
        if (!res.ok) throw new Error("Falha ao carregar polígonos");
        const data = await res.json();

        map.addSource("ucs", { type: "geojson", data });

        map.addLayer({
          id: "ucs-fill",
          type: "fill",
          source: "ucs",
          paint: { "fill-color": "#15803d", "fill-opacity": 0.35 },
        });

        map.addLayer({
          id: "ucs-line",
          type: "line",
          source: "ucs",
          paint: { "line-color": "#166534", "line-width": 0.8 },
        });

        const bounds = new maplibregl.LngLatBounds();
        for (const feature of data.features) {
          const geometry = feature.geometry;
          if (!geometry) continue;
          if (geometry.type === "Polygon") {
            for (const ring of geometry.coordinates) {
              for (const [lng, lat] of ring) bounds.extend([lng, lat]);
            }
          } else if (geometry.type === "MultiPolygon") {
            for (const polygon of geometry.coordinates) {
              for (const ring of polygon) {
                for (const [lng, lat] of ring) bounds.extend([lng, lat]);
              }
            }
          }
        }
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 40, maxZoom: 10 });
        }

        map.on("click", "ucs-fill", (e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const p = feature.properties || {};
          const nome = escapar(p.nome);
          const slug = p.slug ? escapar(p.slug) : null;
          const categoria = escapar(p.categoria);
          const esfera = escapar(p.esfera);
          const uf = escapar(p.uf);

          const root = document.createElement("div");
          root.className = "space-y-1";
          const titulo = document.createElement("strong");
          titulo.className = "block text-sm leading-snug";
          titulo.textContent = nome;
          root.appendChild(titulo);

          const detalhe = document.createElement("span");
          detalhe.className = "block text-xs text-gray-500";
          detalhe.textContent = [categoria, esfera, uf].filter(Boolean).join(" · ");
          root.appendChild(detalhe);

          if (slug) {
            const link = document.createElement("a");
            link.href = `/ucs/${slug}`;
            link.className = "mt-2 inline-block text-xs font-medium text-primary-600 underline";
            link.textContent = "Abrir ficha da UC →";
            root.appendChild(link);
          }

          new maplibregl.Popup({ closeButton: false, maxWidth: "280px" })
            .setLngLat(e.lngLat)
            .setDOMContent(root)
            .addTo(map);
        });

        map.on("mouseenter", "ucs-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "ucs-fill", () => {
          map.getCanvas().style.cursor = "";
        });

        setStatus("pronto");
      } catch {
        setStatus("erro");
      }
    });

    return () => {
      map.off("error", handleError);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-xl border border-gray-200">
      <div ref={containerRef} className="h-full w-full" aria-label="Mapa das Unidades de Conservação do Brasil" />
      {status === "carregando" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="text-sm text-gray-500">Carregando mapa…</p>
        </div>
      )}
      {status === "erro" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <p className="max-w-sm px-4 text-center text-sm text-red-600">
            Não foi possível carregar o mapa. Tente recarregar a página.
          </p>
        </div>
      )}
    </div>
  );
}
