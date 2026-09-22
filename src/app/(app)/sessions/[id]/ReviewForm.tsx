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
      <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">
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
        <p className="mb-2 text-sm font-medium text-slate-700">
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
              className="p-0.5"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill={n <= (hover || rating) ? "#f59e0b" : "none"}
                stroke={n <= (hover || rating) ? "#f59e0b" : "#cbd5e1"}
                strokeWidth="1.5"
                className={cn("transition-colors")}
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
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending || rating === 0}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
