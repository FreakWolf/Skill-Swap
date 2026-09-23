import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { requireUser } from "@/lib/auth";
import { getConversationThread } from "@/lib/messaging";
import { ChatThread } from "./ChatThread";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireUser();

  const thread = await getConversationThread(id, user.id);
  if (!thread) notFound();

  return (
    // Fill the app main area; the thread scrolls internally.
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3">
        <Link
          href="/messages"
          className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
          aria-label="Back to messages"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link href={`/u/${thread.other.id}`} className="flex items-center gap-3">
          <Avatar
            name={thread.other.full_name}
            url={thread.other.avatar_url}
            size={40}
          />
          <span className="font-semibold text-gray-900">
            {thread.other.full_name}
          </span>
        </Link>
      </div>

      <ChatThread
        conversationId={id}
        meId={user.id}
        initialMessages={thread.messages}
      />
    </div>
  );
}
