import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  ConversationSummary,
  Message,
  Notification,
} from "@/lib/types";

// All conversations the current user is part of, newest activity first, each
// with the other participant, a last-message preview, and unread count.
export async function getConversations(
  userId: string,
): Promise<ConversationSummary[]> {
  const supabase = await createClient();

  const { data: convs } = await supabase
    .from("conversations")
    .select(
      `id, user_a, user_b, updated_at,
       a:profiles!conversations_user_a_fkey ( id, full_name, avatar_url ),
       b:profiles!conversations_user_b_fkey ( id, full_name, avatar_url )`,
    )
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (!convs || convs.length === 0) return [];

  const ids = convs.map((c) => c.id as string);

  // Last message per conversation (fetch recent, reduce in JS — fine at MVP scale).
  const { data: msgs } = await supabase
    .from("messages")
    .select("conversation_id, body, created_at, sender_id")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false });

  // The current user's read markers.
  const { data: reads } = await supabase
    .from("conversation_reads")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId)
    .in("conversation_id", ids);

  const lastByConv = new Map<string, { body: string; created_at: string }>();
  const unreadByConv = new Map<string, number>();
  const readMap = new Map(
    (reads ?? []).map((r) => [r.conversation_id as string, r.last_read_at as string]),
  );

  for (const m of msgs ?? []) {
    const cid = m.conversation_id as string;
    if (!lastByConv.has(cid)) {
      lastByConv.set(cid, {
        body: m.body as string,
        created_at: m.created_at as string,
      });
    }
    // Count messages from the other person newer than my last_read_at.
    const lastRead = readMap.get(cid);
    const isFromOther = (m.sender_id as string) !== userId;
    const isNewer = !lastRead || (m.created_at as string) > lastRead;
    if (isFromOther && isNewer) {
      unreadByConv.set(cid, (unreadByConv.get(cid) ?? 0) + 1);
    }
  }

  return convs.map((c) => {
    const a = Array.isArray(c.a) ? c.a[0] : c.a;
    const b = Array.isArray(c.b) ? c.b[0] : c.b;
    const other = (a?.id as string) === userId ? b : a;
    const last = lastByConv.get(c.id as string);
    return {
      id: c.id as string,
      other: {
        id: (other?.id as string) ?? "",
        full_name: (other?.full_name as string) ?? "Member",
        avatar_url: (other?.avatar_url as string) ?? null,
      },
      lastMessage: last?.body ?? "",
      lastMessageAt: last?.created_at ?? null,
      unread: unreadByConv.get(c.id as string) ?? 0,
    };
  });
}

// Total unread messages across all the user's conversations (for the badge).
export async function getUnreadMessageCount(userId: string): Promise<number> {
  const convs = await getConversations(userId);
  return convs.reduce((sum, c) => sum + c.unread, 0);
}

// One conversation's messages (oldest first) + the other participant.
export async function getConversationThread(
  conversationId: string,
  userId: string,
): Promise<{
  messages: Message[];
  other: { id: string; full_name: string; avatar_url: string | null };
} | null> {
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select(
      `id, user_a, user_b,
       a:profiles!conversations_user_a_fkey ( id, full_name, avatar_url ),
       b:profiles!conversations_user_b_fkey ( id, full_name, avatar_url )`,
    )
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return null;

  // Guard: only members may read (RLS also enforces this).
  if (conv.user_a !== userId && conv.user_b !== userId) return null;

  const a = Array.isArray(conv.a) ? conv.a[0] : conv.a;
  const b = Array.isArray(conv.b) ? conv.b[0] : conv.b;
  const other = (a?.id as string) === userId ? b : a;

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .returns<Message[]>();

  return {
    messages: messages ?? [],
    other: {
      id: (other?.id as string) ?? "",
      full_name: (other?.full_name as string) ?? "Member",
      avatar_url: (other?.avatar_url as string) ?? null,
    },
  };
}

// Notifications for the current user, newest first.
export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, kind, title, body, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Notification[]>();
  return data ?? [];
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  return count ?? 0;
}
