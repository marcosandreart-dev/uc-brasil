"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const GEOJSON_URL = "/ucs_poligonos.geojson";
const RASTER_BASEMAP = "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";

const ESTILO_LOCAL: maplibregl.StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "fundo",
      type: "background",
      paint: { "background-color": "#f3f6f4" },
    },
  ],
};

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

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container,
        style: ESTILO_LOCAL,
        center: [-52, -14],
        zoom: 3.5,
        attributionControl: { compact: true },
      });
    } catch {
      setStatus("erro");
      return;
    }
    mapRef.current = map;

    let dados: { features: Array<{ geometry: any; properties: any }> } | null = null;
    let adicionado = false;

    const adicionarBasemap = () => {
      try {
        map.addSource("basemap", {
          type: "raster",
          tiles: [RASTER_BASEMAP],
          tileSize: 256,
          attribution: "© CARTO, © OpenStreetMap contributors",
        });
        map.addLayer(
          { id: "basemap-camada", type: "raster", source: "basemap" },
          "ucs-fill"
        );
      } catch {
        /* basemap é opcional */
      }
    };

    const adicionarCamadas = () => {
      if (adicionado || !dados || !map.isStyleLoaded()) return;
      try {
        map.addSource("ucs", { type: "geojson", data: dados as any });

        map.addLayer({
          id: "ucs-fill",
          type: "fill",
          source: "ucs",
          paint: { "fill-color": "#15803d", "fill-opacity": 0.4 },
        });

        map.addLayer({
          id: "ucs-line",
          type: "line",
          source: "ucs",
          paint: { "line-color": "#166534", "line-width": 0.8 },
        });

        const bounds = new maplibregl.LngLatBounds();
        for (const feature of dados.features) {
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

        adicionarBasemap();
        adicionado = true;
        setStatus("pronto");
      } catch {
        setStatus("erro");
      }
    };

    map.on("load", adicionarCamadas);
    map.on("style.load", adicionarCamadas);

    fetch(GEOJSON_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar polígonos");
        return res.json();
      })
      .then((data) => {
        dados = data;
        adicionarCamadas();
      })
      .catch(() => setStatus("erro"));

    const watchdog = window.setInterval(adicionarCamadas, 1000);
    const failsafe = window.setTimeout(() => {
      if (!adicionado) {
        if (map.isStyleLoaded() && dados) adicionarCamadas();
        else setStatus("erro");
      }
    }, 20000);

    return () => {
      window.clearInterval(watchdog);
      window.clearTimeout(failsafe);
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
