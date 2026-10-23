"use client";

import { useState, useTransition } from "react";
import { Ban } from "lucide-react";
import { blockUser, unblockUser } from "@/app/(app)/safety/actions";
import { Button } from "@/components/ui/Button";

// Block / unblock toggle. Blocking asks for confirmation first.
export function BlockButton({
  userId,
  userName,
  blocked,
}: {
  userId: string;
  userName: string;
  blocked: boolean;
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
        variant={blocked ? "outline" : "ghost"}
        size="sm"
        onClick={onClick}
        disabled={pending}
        className={blocked ? "" : "text-red-600 hover:bg-red-50"}
      >
        <Ban className="h-4 w-4" />
        {pending ? (blocked ? "Unblocking…" : "Blocking…") : blocked ? "Unblock" : "Block"}
      </Button>
      {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
    </span>
  );
}
