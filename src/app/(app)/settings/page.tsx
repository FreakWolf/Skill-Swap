import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { logOut } from "@/app/(auth)/actions";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Avatar } from "@/components/Avatar";
import { BlockButton } from "@/components/safety/BlockButton";
import { getMyBlockedUsers } from "@/lib/safety";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const { user, profile } = await requireUser();
  const blocked = await getMyBlockedUsers(user.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Profile</h2>
        <div className="mb-6 border-b border-[var(--border)] pb-6">
          <AvatarUpload
            userId={user.id}
            name={profile?.full_name ?? ""}
            initialUrl={profile?.avatar_url ?? null}
          />
        </div>
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

      <Card className="p-6">
        <h2 className="mb-1 font-semibold text-slate-900">Availability</h2>
        <p className="mb-3 text-sm text-slate-500">
          Open bookable time slots for the skills you teach.
        </p>
        <Link href="/availability">
          <Button variant="outline">Manage availability</Button>
        </Link>
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 font-semibold text-slate-900">Blocked users</h2>
        <p className="mb-3 text-sm text-slate-500">
          People you&apos;ve blocked can&apos;t message or book with you.
        </p>
        {blocked.length === 0 ? (
          <p className="text-sm text-slate-400">You haven&apos;t blocked anyone.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {blocked.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3">
                <Avatar name={b.full_name} url={b.avatar_url} size={36} />
                <span className="flex-1 truncate text-sm font-medium text-slate-800">
                  {b.full_name}
                </span>
                <BlockButton userId={b.id} userName={b.full_name} blocked />
              </li>
            ))}
          </ul>
        )}
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

export const metadata = { title: "Settings" };
