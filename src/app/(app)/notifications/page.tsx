import Link from "next/link";
import { Bell, Calendar, MessageSquare, Coins, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/messaging";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "./actions";

function iconFor(kind: string) {
  switch (kind) {
    case "booking":
      return { Icon: Calendar, tile: "bg-brand-soft text-brand-soft-fg" };
    case "message":
      return { Icon: MessageSquare, tile: "bg-accent-soft text-accent-fg" };
    case "credit":
      return { Icon: Coins, tile: "bg-warning-soft text-warning-fg" };
    default:
      return { Icon: Info, tile: "bg-input text-muted" };
  }
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function NotificationBody({
  n,
}: {
  n: { title: string; body: string; read: boolean; created_at: string };
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <p className="font-semibold text-foreground">{n.title}</p>
        {!n.read && (
          <span className="bg-gradient-primary h-2.5 w-2.5 shrink-0 rounded-full">
            <span className="sr-only">Unread</span>
          </span>
        )}
        <span className="ml-auto shrink-0 text-xs text-muted">
          {relativeTime(n.created_at)}
        </span>
      </div>
      {n.body && <p className="mt-0.5 text-sm text-muted">{n.body}</p>}
    </>
  );
}

export default async function NotificationsPage() {
  const { user } = await requireUser();
  const notifications = await getNotifications(user.id);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="mt-1 text-muted">
            Bookings, messages, and updates from your activity.
          </p>
        </div>
        {hasUnread && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="outline">
              Mark all read
            </Button>
          </form>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const { Icon, tile } = iconFor(n.kind);
            const target =
              n.kind === "message"
                ? "/messages"
                : n.kind === "booking"
                  ? "/sessions"
                  : null;
            return (
              <Reveal key={n.id} delay={i}>
              <Card
                variant="solid"
                interactive
                className={
                  "flex items-start gap-3 p-4 " + (n.read ? "" : "ring-2 ring-link/40")
                }
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tile}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                {/* Body links to the relevant screen when applicable. */}
                {target ? (
                  <Link href={target} className="min-w-0 flex-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <NotificationBody n={n} />
                  </Link>
                ) : (
                  <div className="min-w-0 flex-1">
                    <NotificationBody n={n} />
                  </div>
                )}
                {/* Mark-read is a sibling of the link (never nested in an anchor). */}
                {!n.read && (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <button
                      type="submit"
                      className="-my-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-link hover:bg-brand-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Mark read
                    </button>
                  </form>
                )}
              </Card>
              </Reveal>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Bell} title="You're all caught up">
          Notifications about bookings and messages will show up here.
        </EmptyState>
      )}
    </div>
  );
}

export const metadata = { title: "Notifications" };
