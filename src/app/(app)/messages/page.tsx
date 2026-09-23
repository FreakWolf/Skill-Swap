import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/Avatar";
import { requireUser } from "@/lib/auth";
import { getConversations } from "@/lib/messaging";

function relativeTime(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default async function MessagesPage() {
  const { user } = await requireUser();
  const conversations = await getConversations(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
        <p className="mt-1 text-gray-600">
          Chat with teachers and learners before and after your sessions.
        </p>
      </div>

      {conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`}>
              <Card className="flex items-center gap-3 p-4 transition-shadow hover:shadow-md">
                <Avatar name={c.other.full_name} url={c.other.avatar_url} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-gray-900">
                      {c.other.full_name}
                    </p>
                    <span className="ml-auto shrink-0 text-xs text-gray-400">
                      {relativeTime(c.lastMessageAt)}
                    </span>
                  </div>
                  <p
                    className={
                      c.unread > 0
                        ? "truncate text-sm font-medium text-gray-900"
                        : "truncate text-sm text-gray-500"
                    }
                  >
                    {c.lastMessage || "No messages yet"}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
                    {c.unread}
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <MessageSquare className="h-7 w-7" />
          </div>
          <p className="mt-4 font-medium text-gray-900">No conversations yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Message a teacher from their profile or an offering to get started.
          </p>
          <Link
            href="/marketplace"
            className="mt-4 text-sm font-medium text-blue-600 hover:underline"
          >
            Explore skills
          </Link>
        </Card>
      )}
    </div>
  );
}
