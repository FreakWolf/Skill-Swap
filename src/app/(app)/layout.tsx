import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { requireUser, getBalance } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireUser();

  // Force users through onboarding before they reach the app.
  if (profile && !profile.onboarded) {
    redirect("/onboarding/profile");
  }

  const balance = await getBalance(user.id);

  return (
    <div className="flex h-screen bg-gray-50 lg:flex-row flex-col">
      <Sidebar
        name={profile?.full_name ?? ""}
        email={user.email ?? ""}
        avatarUrl={profile?.avatar_url ?? null}
        balance={balance}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
