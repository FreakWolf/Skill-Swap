import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { logOut } from "@/app/(auth)/actions";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const { profile } = await requireUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Profile</h2>
        <SettingsForm
          defaultName={profile?.full_name ?? ""}
          defaultBio={profile?.bio ?? ""}
          defaultLocation={profile?.location ?? ""}
          defaultLanguages={(profile?.languages ?? []).join(", ")}
        />
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 font-semibold text-slate-900">Skills</h2>
        <p className="mb-3 text-sm text-slate-500">
          Update what you teach and want to learn.
        </p>
        <Link href="/onboarding/skills">
          <Button variant="outline">Manage skills</Button>
        </Link>
      </Card>

      <Card className="flex items-center justify-between p-6">
        <div>
          <h2 className="font-semibold text-slate-900">Sign out</h2>
          <p className="text-sm text-slate-500">End your session on this device.</p>
        </div>
        <form action={logOut}>
          <Button type="submit" variant="danger">
            Sign out
          </Button>
        </form>
      </Card>
    </div>
  );
}
