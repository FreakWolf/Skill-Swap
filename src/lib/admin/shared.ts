import "server-only";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const PAGE_SIZE = 25;

// The only way admin data helpers get a service-role client: the caller's
// session is verified first. Pages and layouts render concurrently, so the
// admin layout's redirect alone would not stop a page's queries.
export async function adminDb() {
  await requireAdmin();
  return createAdminClient();
}

// Log the real database error on the server and hand the client a generic
// message, so internal table and constraint names never reach the browser.
export function publicError(context: string, error: { message: string; code?: string }): string {
  console.error(`[admin] ${context}: ${error.code ?? ""} ${error.message}`);
  if (error.code === "23505") return "That already exists.";
  if (error.code === "23503") return "That record is still referenced by something else.";
  if (error.code === "42501") return "You don't have permission to do that.";
  return "Something went wrong. Please try again.";
}

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

// Escape user input for PostgREST `ilike` patterns. Backslash first, then the
// wildcard characters, and commas (PostgREST's filter separator).
export function like(q: string): string {
  const escaped = q.replace(/\\/g, "\\\\").replace(/[%_]/g, (m) => `\\${m}`).replace(/,/g, "\\,");
  return `%${escaped}%`;
}

// Supabase returns joined relations as an object or a one-element array
// depending on the relationship; normalise to the object.
export function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}
