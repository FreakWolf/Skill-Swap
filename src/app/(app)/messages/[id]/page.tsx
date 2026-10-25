import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { requireUser } from "@/lib/auth";
import { getConversationThread } from "@/lib/messaging";
import { getTimeZone } from "@/lib/time";
import { getBlockStatus } from "@/lib/safety";
import { ReportDialog } from "@/components/safety/ReportDialog";
import { BlockButton } from "@/components/safety/BlockButton";
import { ChatThread } from "./ChatThread";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();

  const [thread, tz] = await Promise.all([
    getConversationThread(id, user.id),
    getTimeZone(),
  ]);
  if (!thread) notFound();

  const block = await getBlockStatus(user.id, thread.other.id);

  return (
    // Fill the app main area; the thread scrolls internally.
    // Fits the visible screen exactly: 100dvh minus the mobile header (4rem)
    // and the page padding (4rem); desktop has no header.
    <div className="flex h-[calc(100dvh-8rem)] flex-col lg:h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="glass-strong flex items-center gap-3 rounded-3xl border p-2 pr-3 shadow-soft">
        <Link
          href="/messages"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-brand-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to messages"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>
        <Link href={`/u/${thread.other.id}`} className="flex min-w-0 items-center gap-3 rounded-full pr-2 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar
            name={thread.other.full_name}
            url={thread.other.avatar_url}
            size={40}
          />
          <span className="truncate font-semibold text-foreground">
            {thread.other.full_name}
          </span>
        </Link>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <ReportDialog
            userId={thread.other.id}
            userName={thread.other.full_name}
            contextType="message"
            contextId={id}
            showBlockOption={!block.iBlocked && !block.blockedMe}
            compact
          />
          {!block.blockedMe && (
            <BlockButton
              userId={thread.other.id}
              userName={thread.other.full_name}
              blocked={block.iBlocked}
              compact
            />
          )}
        </div>
      </div>

      <ChatThread
        conversationId={id}
        meId={user.id}
        initialMessages={thread.messages}
        tz={tz}
        blockedNotice={
          block.iBlocked
            ? `You blocked ${thread.other.full_name}. Unblock them to send messages.`
            : block.blockedMe
              ? "You can't reply to this conversation."
              : null
        }
      />
    </div>
  );
}

export const metadata = { title: "Chat" };
