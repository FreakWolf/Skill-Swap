import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Sidebar } from "@/components/Sidebar";
import { requireUser, getBalance } from "@/lib/auth";
import {
  getUnreadMessageCount,
  getUnreadNotificationCount,
} from "@/lib/messaging";

// Streams the live counts (balance + unread badges) into the sidebar without
// blocking the page render. The shell paints immediately; counts fill in.
async function SidebarWithData({
  name,
  email,
  avatarUrl,
  userId,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
  userId: string;
}) {
  const [balance, unreadMessages, unreadNotifications] = await Promise.all([
    getBalance(userId),
    getUnreadMessageCount(userId),
    getUnreadNotificationCount(userId),
  ]);

  return (
    <Sidebar
      name={name}
      email={email}
      avatarUrl={avatarUrl}
      balance={balance}
      unreadMessages={unreadMessages}
      unreadNotifications={unreadNotifications}
    />
  );
}

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

  const name = profile?.full_name ?? "";
  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <div className="flex h-screen flex-col bg-gray-50 lg:flex-row">
      {/* Sidebar shell renders instantly; counts stream in via Suspense. */}
      <Suspense
        fallback={
          <Sidebar
            name={name}
            email={user.email ?? ""}
            avatarUrl={avatarUrl}
            balance={0}
          />
        }
      >
        <SidebarWithData
          name={name}
          email={user.email ?? ""}
          avatarUrl={avatarUrl}
          userId={user.id}
        />
      </Suspense>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
