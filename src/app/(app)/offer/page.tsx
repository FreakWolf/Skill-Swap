import { PlusCircle } from "lucide-react";
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
      <div className="flex items-start gap-4">
        <span className="bg-gradient-primary hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-soft sm:flex">
          <PlusCircle className="h-6 w-6" aria-hidden />
        </span>
        <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Offer a skill</h1>
        <p className="mt-1 text-muted">
          Publish something you can teach. You earn credits each time someone
          completes a session with you.
        </p>
        </div>
      </div>
      <Card className="p-5 sm:p-8">
        <OfferForm skillNames={(skills ?? []).map((s) => s.name as string)} />
      </Card>
    </div>
  );
}

export const metadata = { title: "Offer a skill" };
