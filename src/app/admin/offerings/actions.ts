"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminDb, publicError } from "@/lib/admin/shared";
import { logAdminAction } from "@/lib/admin/audit";

export type FlagState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  id: z.string().uuid(),
  field: z.enum(["is_featured", "is_active"]),
  value: z.enum(["true", "false"]),
});

// Toggles featured/active on an offering. Pausing keeps the offering's open
// slots (hidden, not deleted); the database refuses bookings on paused
// offerings and un-features them automatically.
export async function setOfferingFlag(_prev: FlagState, formData: FormData): Promise<FlagState> {
  const { user } = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid request" };

  const value = parsed.data.value === "true";
  const admin = await adminDb();
  const { error } = await admin
    .from("offerings")
    .update({ [parsed.data.field]: value })
    .eq("id", parsed.data.id);
  if (error) return { error: publicError("setOfferingFlag", error) };

  try {
    await logAdminAction(
      user.id,
      `offering.${parsed.data.field === "is_featured" ? (value ? "feature" : "unfeature") : value ? "activate" : "deactivate"}`,
      "offering",
      parsed.data.id,
    );
  } catch {
    return { error: "Saved, but the audit entry could not be written." };
  }

  revalidatePath("/admin/offerings");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath(`/offerings/${parsed.data.id}`);
  return { ok: true };
}
