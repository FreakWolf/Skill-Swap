import { Stepper } from "@/components/Stepper";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SkillsForm } from "./SkillsForm";

export default async function SkillsSetupPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: catalog } = await supabase
    .from("skills")
    .select("name, category")
    .eq("is_custom", false)
    .order("category")
    .order("name");

  return (
    <div>
      <Stepper steps={["Profile", "Skills"]} current={1} />
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        What can you teach &amp; learn?
      </h1>
      <p className="mt-1 text-muted">
        Add skills you can teach to earn credits, and skills you want to learn.
      </p>
      <Card className="mt-6 p-6">
        <SkillsForm catalog={catalog ?? []} />
      </Card>
    </div>
  );
}

export const metadata = { title: "Your skills" };
