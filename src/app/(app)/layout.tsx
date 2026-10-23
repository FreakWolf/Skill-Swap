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
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      {/* Keyboard users can jump past the navigation. */}
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
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
      {/* The page itself scrolls (not an inner box): smoother on phones,
          and works with keyboard scrolling. */}
      <main id="main" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Signed-in pages are private: keep them out of search results.
export const metadata = { robots: { index: false, follow: false } };
