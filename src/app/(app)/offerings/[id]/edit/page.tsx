import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Offering } from "@/lib/types";
import { EditOfferingForm } from "./EditOfferingForm";
import { DangerZone } from "./DangerZone";

export const metadata = { title: "Edit offering" };

export default async function EditOfferingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireUser();
  const supabase = await createClient();

  const [{ data: offering }, { data: skills }] = await Promise.all([
    supabase
      .from("offerings")
      .select("*, skill:skills!offerings_skill_id_fkey ( name )")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("skills").select("name").order("name"),
  ]);
  if (!offering) notFound();
  if (offering.teacher_id !== user.id) redirect(`/offerings/${id}`);

  const skill = Array.isArray(offering.skill) ? offering.skill[0] : offering.skill;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/offerings/${id}`} className="inline-block py-1 text-sm text-slate-500 hover:underline">
          ← Back to offering
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Edit offering</h1>
          <Badge className={offering.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}>
            {offering.is_active ? "Active" : "Paused"}
          </Badge>
          {offering.is_featured && <Badge className="bg-brand-orange-50 text-brand-orange-700">Featured</Badge>}
        </div>
        <p className="mt-1 text-gray-600">
          Manage time slots from{" "}
          <Link href="/availability" className="font-medium text-brand-fg hover:underline">Availability</Link>.
        </p>
      </div>

      <Card className="p-6">
        <EditOfferingForm
          offering={offering as unknown as Offering}
          skillName={(skill?.name as string) ?? ""}
          skillNames={(skills ?? []).map((s) => s.name as string)}
        />
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Visibility</h2>
        <DangerZone id={id} isActive={offering.is_active} />
      </Card>
    </div>
  );
}
