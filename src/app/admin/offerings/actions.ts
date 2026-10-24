"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/audit";

const schema = z.object({
  id: z.string().uuid(),
  field: z.enum(["is_featured", "is_active"]),
  value: z.enum(["true", "false"]),
});

// Toggles featured/active on an offering. Plain form action; the page
// re-renders through revalidatePath.
export async function setOfferingFlag(formData: FormData) {
  const { user } = await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const value = parsed.data.value === "true";
  const admin = createAdminClient();
  const update: Record<string, boolean> = { [parsed.data.field]: value };
  // A paused offering should not stay featured.
  if (parsed.data.field === "is_active" && !value) update.is_featured = false;
  await admin.from("offerings").update(update).eq("id", parsed.data.id);

  // Pausing also frees unbooked future slots so nothing can be booked.
  if (parsed.data.field === "is_active" && !value) {
    await admin
      .from("availability")
      .delete()
      .eq("offering_id", parsed.data.id)
      .eq("is_booked", false)
      .gt("starts_at", new Date().toISOString());
  }

  await logAdminAction(
    user.id,
    `offering.${parsed.data.field === "is_featured" ? (value ? "feature" : "unfeature") : value ? "activate" : "deactivate"}`,
    "offering",
    parsed.data.id,
  );
  revalidatePath("/admin/offerings");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath(`/offerings/${parsed.data.id}`);
}
