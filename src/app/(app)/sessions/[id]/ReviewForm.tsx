"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { submitReview, type SessionActionState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

export function ReviewForm({
  bookingId,
  revieweeId,
  revieweeName,
}: {
  bookingId: string;
  revieweeId: string;
  revieweeName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, action, pending] = useActionState<SessionActionState, FormData>(
    submitReview,
    undefined,
  );

  if (state?.ok) {
    router.refresh();
    return (
      <p className="animate-fade-up rounded-2xl border border-success-fg/25 bg-success-soft px-4 py-3 text-sm text-success-fg">
        Thanks for your review!
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="revieweeId" value={revieweeId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          How was your session with {revieweeName}?
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              className="rounded-full p-0.5 transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:scale-100"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                aria-hidden
                className={cn(
                  "transition-colors",
                  n <= (hover || rating) ? "fill-star stroke-star" : "fill-none stroke-border-strong",
                )}
              >
                <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <Textarea
        name="comment"
        placeholder="Share what went well (optional)"
      />

      {state?.error && (
        <p className="rounded-2xl border border-danger-fg/25 bg-danger-soft px-4 py-3 text-sm text-danger-fg">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending || rating === 0}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
