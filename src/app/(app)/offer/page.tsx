import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OfferForm } from "./OfferForm";

export default async function OfferPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: skills } = await supabase
    .from("skills")
    .select("name")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Offer a skill</h1>
        <p className="mt-1 text-slate-600">
          Publish something you can teach. You earn credits each time someone
          completes a session with you.
        </p>
      </div>
      <Card className="p-6">
        <OfferForm skillNames={(skills ?? []).map((s) => s.name as string)} />
      </Card>
    </div>
  );
}
