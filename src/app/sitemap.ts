import type { MetadataRoute } from "next";
import { listarSlugs } from "@/lib/ucs";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ucbrasil.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const ucs = listarSlugs().map(({ slug }) => ({
    url: `${BASE_URL}/ucs/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/buscar`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...ucs,
  ];
}
