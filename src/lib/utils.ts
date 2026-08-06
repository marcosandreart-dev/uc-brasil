import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classNames do Tailwind CSS de forma segura,
 * resolvendo conflitos entre classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um número como moeda brasileira (BRL).
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata uma data no padrão brasileiro (dd/MM/yyyy).
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Gera uma slug a partir de um texto.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Formata uma área em hectares no padrão brasileiro.
 */
export function formatArea(areaHa: number | null): string {
  if (areaHa === null || areaHa === undefined) return "";
  return `${areaHa.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ha`;
}

/**
 * Limita um texto a um número máximo de caracteres,
 * adicionando reticências se necessário.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + "...";
}

/**
 * Gera a URL de compartilhamento para uma UC.
 */
export function buildShareUrl(ucId: string, baseUrl?: string): string {
  const url = baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${url}/ucs/${ucId}`;
}
