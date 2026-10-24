import "server-only";

export const PAGE_SIZE = 25;

export interface Paged<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type SearchParams = Record<string, string | string[] | undefined>;

export function param(sp: SearchParams, key: string): string {
  const v = sp[key];
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export function pageFrom(sp: SearchParams): number {
  const n = Number.parseInt(param(sp, "page") || "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

// Inclusive range for a PostgREST `.range(from, to)` call.
export function range(page: number, pageSize = PAGE_SIZE) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

export function paged<T>(rows: T[] | null, total: number | null, page: number): Paged<T> {
  return { rows: rows ?? [], total: total ?? 0, page, pageSize: PAGE_SIZE };
}

// Escape user input for PostgREST `ilike` patterns.
export function like(q: string): string {
  return `%${q.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
}

// Supabase returns joined relations as an object or a one-element array
// depending on the relationship; normalise to the object.
export function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}
