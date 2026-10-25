import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Messages</h1>
        <p className="mt-1 text-muted">
          Chat with teachers and learners before and after your sessions.
        </p>
      </div>

      {conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((c, i) => (
            <Reveal key={c.id} delay={i}>
            <Link
              href={`/messages/${c.id}`}
              className="lift flex items-center gap-3 rounded-3xl border border-border bg-card-solid p-4 shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <Avatar name={c.other.full_name} url={c.other.avatar_url} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-foreground">
                      {c.other.full_name}
                    </p>
                    <span className="ml-auto shrink-0 text-xs text-muted">
                      {relativeTime(c.lastMessageAt)}
                    </span>
                  </div>
                  <p
                    className={
                      c.unread > 0
                        ? "truncate text-sm font-semibold text-foreground"
                        : "truncate text-sm text-muted"
                    }
                  >
                    {c.lastMessage || "No messages yet"}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="bg-gradient-primary flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white">
                    {c.unread}
                  </span>
                )}
            </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          action={
            <ButtonLink href="/marketplace" variant="secondary">
              Explore skills
            </ButtonLink>
          }
        >
          Message a teacher from their profile or an offering to get started.
        </EmptyState>
      )}
    </div>
  );
}

export const metadata = { title: "Messages" };
