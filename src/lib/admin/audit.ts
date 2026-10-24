import "server-only";

import type { AdminAuditEntry } from "@/lib/types";
import { PAGE_SIZE, adminDb, one, paged, range, type Paged } from "./shared";

// Every admin mutation records what was done, by whom, to what. Throws when
// the row cannot be written so callers never report success without a trail.
export async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown> = {},
) {
  const admin = await adminDb();
  const { error } = await admin.from("admin_audit_log").insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  });
  if (error) {
    console.error(`[admin] audit log write failed for ${action}: ${error.message}`);
    throw new Error("audit log write failed");
  }
}

export interface AuditRow extends AdminAuditEntry {
  admin: { id: string; full_name: string } | null;
}

export async function listAudit(page: number): Promise<Paged<AuditRow>> {
  const admin = await adminDb();
  const { from, to } = range(page, PAGE_SIZE);
  const { data, count } = await admin
    .from("admin_audit_log")
    .select("*, admin:profiles!admin_audit_log_admin_id_fkey ( id, full_name )", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  const rows = (data ?? []).map((r) => ({ ...r, admin: one(r.admin) })) as AuditRow[];
  return paged(rows, count, page);
}
