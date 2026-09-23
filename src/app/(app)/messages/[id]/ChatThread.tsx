"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markConversationRead, type MessageState } from "../actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Message } from "@/lib/types";

function time(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ChatThread({
  conversationId,
  meId,
  initialMessages,
}: {
  conversationId: string;
  meId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [state, action, pending] = useActionState<MessageState, FormData>(
    sendMessage,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to new messages in this conversation via Supabase Realtime.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Mark read on open and whenever new messages arrive.
  useEffect(() => {
    markConversationRead(conversationId);
  }, [conversationId, messages.length]);

  // Keep the view pinned to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Clear the input after a successful send.
  useEffect(() => {
    if (!pending) formRef.current?.reset();
  }, [pending]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-400">
            No messages yet. Say hello 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === meId;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-blue-600 text-white"
                      : "rounded-bl-sm bg-gray-100 text-gray-900",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      mine ? "text-blue-100" : "text-gray-400",
                    )}
                  >
                    {time(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        ref={formRef}
        action={action}
        className="flex items-end gap-2 border-t border-[var(--border)] bg-white py-3"
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <textarea
          name="body"
          rows={1}
          required
          placeholder="Type a message…"
          className="max-h-32 flex-1 resize-none rounded-2xl border border-transparent bg-neutral-200 px-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
        <Button type="submit" disabled={pending} className="rounded-full">
          Send
        </Button>
      </form>
      {state?.error && (
        <p className="pb-2 text-sm text-red-600">{state.error}</p>
      )}
    </div>
  );
}
