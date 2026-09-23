"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type MessageState = { error?: string } | undefined;

// Start (or open) a conversation with another user, then go to the chat.
export async function startConversation(formData: FormData) {
  const otherId = String(formData.get("otherId") ?? "");
  if (!otherId) return;

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  });
  if (error) return { error: error.message };

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  return undefined;
}

// Mark a conversation read up to now (clears unread for the current user).
export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

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
