"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markConversationRead } from "../actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Message } from "@/lib/types";

function time(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

// A message plus an optional client-generated key so we can render an
// optimistic bubble immediately and reconcile it when the real row arrives.
type LocalMessage = Message & { pending?: boolean };

export function ChatThread({
  conversationId,
  meId,
  initialMessages,
}: {
  conversationId: string;
  meId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<LocalMessage[]>(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
          setMessages((prev) => {
            // Already have the real row? ignore.
            if (prev.some((m) => m.id === incoming.id)) return prev;
            // Replace a matching optimistic bubble (same sender + body) if present.
            const optimisticIdx = prev.findIndex(
              (m) =>
                m.pending &&
                m.sender_id === incoming.sender_id &&
                m.body === incoming.body,
            );
            if (optimisticIdx !== -1) {
              const next = [...prev];
              next[optimisticIdx] = incoming;
              return next;
            }
            return [...prev, incoming];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Mark read on open and whenever the message count changes.
  useEffect(() => {
    markConversationRead(conversationId);
  }, [conversationId, messages.length]);

  // Keep the view pinned to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const body = inputRef.current?.value.trim();
    if (!body || sending) return;

    setError(null);
    setSending(true);

    // Optimistically show the sender's own message right away.
    const tempId = `temp-${Date.now()}`;
    const optimistic: LocalMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: meId,
      body,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    if (inputRef.current) inputRef.current.value = "";

    const form = new FormData();
    form.set("conversationId", conversationId);
    form.set("body", body);
    const result = await sendMessage(undefined, form);

    setSending(false);
    if (result?.error) {
      // Roll back the optimistic bubble and surface the error.
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError(result.error);
      return;
    }
    // Reconcile the optimistic bubble with the real saved row immediately,
    // so it never gets stuck on "Sending…" even if realtime is slow/off.
    if (result?.message) {
      const saved = result.message;
      setMessages((prev) => {
        // If realtime already delivered it, drop the temp bubble.
        if (prev.some((m) => m.id === saved.id)) {
          return prev.filter((m) => m.id !== tempId);
        }
        return prev.map((m) => (m.id === tempId ? saved : m));
      });
    }
  }

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
                    m.pending && "opacity-70",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      mine ? "text-blue-100" : "text-gray-400",
                    )}
                  >
                    {m.pending ? "Sending…" : time(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex items-end gap-2 border-t border-[var(--border)] bg-white py-3">
        <textarea
          ref={inputRef}
          rows={1}
          placeholder="Type a message…"
          className="max-h-32 flex-1 resize-none rounded-2xl border border-transparent bg-neutral-200 px-4 py-2.5 text-sm focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="rounded-full"
        >
          Send
        </Button>
      </div>
      {error && <p className="pb-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
