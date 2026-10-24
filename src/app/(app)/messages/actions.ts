"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth";

import type { Message } from "@/lib/types";

export type MessageState =
  | { error?: string; message?: Message }
  | undefined;

// Start (or open) a conversation with another user, then go to the chat.
export async function startConversation(formData: FormData) {
  const otherId = String(formData.get("otherId") ?? "");
  if (!otherId) return;
  const active = await requireActiveUser();
  if (!active.ok) redirect("/messages");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_or_create_conversation", {
    p_other: otherId,
  });
  if (error || !data) redirect("/messages");

  redirect(`/messages/${data as string}`);
}

const sendSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().trim().min(1, "Message can't be empty").max(2000),
});

export async function sendMessage(
  _prev: MessageState,
  formData: FormData,
): Promise<MessageState> {
  const parsed = sendSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid message" };
  }
  const { conversationId, body } = parsed.data;

  const active = await requireActiveUser();
  if (!active.ok) return { error: active.error };
  const { user } = active.session;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body,
    })
    .select("*")
    .single<Message>();
  if (error) return { error: error.message };

  // Refresh the inbox list. The chat itself reconciles from the returned row.
  revalidatePath("/messages");
  return { message: data };
}

// Mark a conversation read up to now (clears unread for the current user).
export async function markConversationRead(conversationId: string) {
  const active = await requireActiveUser();
  if (!active.ok) return;
  const { user } = active.session;
  const supabase = await createClient();

  await supabase.from("conversation_reads").upsert(
    {
      conversation_id: conversationId,
      user_id: user.id,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "conversation_id,user_id" },
  );
  revalidatePath("/messages");
}
