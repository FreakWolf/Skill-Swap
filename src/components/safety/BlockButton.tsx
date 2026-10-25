"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";
import { blockUser, unblockUser } from "@/app/(app)/safety/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Block / unblock toggle. Blocking asks for confirmation first.
export function BlockButton({
  userId,
  userName,
  blocked,
  compact = false,
}: {
  userId: string;
  userName: string;
  blocked: boolean;
  /** Icon-only on small screens (label kept for screen readers). */
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (
      !blocked &&
      !window.confirm(
        `Block ${userName}? You won't be able to message or book each other, and you'll be hidden from each other in Explore. You can unblock anytime in Settings.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = blocked ? await unblockUser(userId) : await blockUser(userId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <span className="inline-flex flex-col items-start">
      <Button
        type="button"
        variant={blocked ? "outline" : "dangerGhost"}
        size="sm"
        onClick={onClick}
        disabled={pending}
        className={cn(compact && "max-sm:h-10 max-sm:px-2.5")}
      >
        <Ban className="h-4 w-4" aria-hidden />
        <span className={compact ? "sr-only sm:not-sr-only" : undefined}>
          {pending ? (blocked ? "Unblocking…" : "Blocking…") : blocked ? "Unblock" : "Block"}
        </span>
      </Button>
      {error && <span className="mt-1 text-xs text-danger-fg">{error}</span>}
    </span>
  );
}
