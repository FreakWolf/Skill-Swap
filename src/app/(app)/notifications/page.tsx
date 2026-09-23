import Link from "next/link";
import { Bell, Calendar, MessageSquare, Coins, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
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
      return { Icon: Calendar, tile: "bg-blue-100 text-blue-600" };
    case "message":
      return { Icon: MessageSquare, tile: "bg-purple-100 text-purple-600" };
    case "credit":
      return { Icon: Coins, tile: "bg-amber-100 text-amber-600" };
    default:
      return { Icon: Info, tile: "bg-gray-100 text-gray-500" };
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
        <p className="font-medium text-gray-900">{n.title}</p>
        {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
        <span className="ml-auto shrink-0 text-xs text-gray-400">
          {relativeTime(n.created_at)}
        </span>
      </div>
      {n.body && <p className="mt-0.5 text-sm text-gray-600">{n.body}</p>}
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
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="mt-1 text-gray-600">
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
          {notifications.map((n) => {
            const { Icon, tile } = iconFor(n.kind);
            const target =
              n.kind === "message"
                ? "/messages"
                : n.kind === "booking"
                  ? "/sessions"
                  : null;
            return (
              <Card
                key={n.id}
                className={
                  "flex items-start gap-3 p-4 transition-shadow hover:shadow-md " +
                  (n.read ? "" : "border-blue-200 bg-blue-50/40")
                }
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tile}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {/* Body links to the relevant screen when applicable. */}
                {target ? (
                  <Link href={target} className="min-w-0 flex-1">
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
                      className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
                    >
                      Mark read
                    </button>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Bell className="h-7 w-7" />
          </div>
          <p className="mt-4 font-medium text-gray-900">You&apos;re all caught up</p>
          <p className="mt-1 text-sm text-gray-500">
            Notifications about bookings and messages will show up here.
          </p>
        </Card>
      )}
    </div>
  );
}
