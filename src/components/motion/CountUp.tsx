"use client";

import { useEffect, useRef } from "react";

/** Counts up to `value` once on mount. The server HTML already holds the
 *  final value (no-JS and SEO correct); screen readers only ever get the
 *  final value. Skipped under reduced motion. */
export function CountUp({
  value,
  durationMs = 700,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !Number.isFinite(value) || value <= 0) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      // Write into React's own text node so later renders still own it.
      const node = el.firstChild;
      if (node) node.nodeValue = String(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else if (node) node.nodeValue = String(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);
  return (
    <span className={className}>
      <span ref={ref} aria-hidden className="tabular-nums">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
