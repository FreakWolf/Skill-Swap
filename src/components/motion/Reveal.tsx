"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

// One shared observer for every reveal on the page.
let observer: IntersectionObserver | null = null;
function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.revealed = "";
          observer?.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
  );
  return observer;
}

type Tag = "div" | "section" | "li" | "article";

/** Fades + slides its children in when scrolled into view. Content is
 *  visible without JS (hiding only applies under `html.js`) and under
 *  reduced motion. `delay` is a stagger index (×60ms, capped at 8). */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
  id,
}: {
  as?: Tag;
  delay?: number;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = getObserver();
    if (!io) {
      el.dataset.revealed = "";
      return;
    }
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return (
    <Tag
      // Callback-free ref typing: all allowed tags are HTMLElements.
      ref={ref as React.Ref<never>}
      id={id}
      data-reveal=""
      className={cn(className)}
      style={{ "--reveal-delay": Math.min(delay, 8) } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
