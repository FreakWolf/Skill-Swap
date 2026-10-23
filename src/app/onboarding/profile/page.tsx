import { Stepper } from "@/components/Stepper";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { AvatarUpload } from "@/components/AvatarUpload";
import { ProfileForm } from "./ProfileForm";

export default async function ProfileSetupPage() {
  const { user, profile } = await requireUser();

  return (
    <div>
      <Stepper steps={["Profile", "Skills"]} current={0} />
      <h1 className="text-2xl font-bold text-slate-900">Set up your profile</h1>
      <p className="mt-1 text-slate-600">
        Tell the community a bit about yourself. You can change this anytime.
      </p>
      <Card className="mt-6 p-6">
        <div className="mb-6 border-b border-[var(--border)] pb-6">
          <p className="mb-3 text-sm font-medium text-slate-700">
            Profile photo <span className="font-normal text-slate-400">(optional)</span>
          </p>
          <AvatarUpload
            userId={user.id}
            name={profile?.full_name ?? ""}
            initialUrl={profile?.avatar_url ?? null}
          />
        </div>
        <ProfileForm
          defaultName={profile?.full_name ?? ""}
          defaultBio={profile?.bio ?? ""}
          defaultLocation={profile?.location ?? ""}
          defaultLanguages={(profile?.languages ?? []).join(", ")}
        />
      </Card>
    </div>
  );
}
