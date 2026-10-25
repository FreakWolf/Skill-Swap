import Image from "next/image";
import { cn } from "@/lib/cn";

// Brand artwork lives in public/brand/ (cut from the original logo.png).
const ASSETS = {
  // "SWAPSKILLS" lettering only, for compact spots (sidebar, headers).
  wordmark: { src: "/brand/wordmark.png", width: 474, height: 51 },
  // Illustration + lettering, for hero spots (auth pages).
  full: { src: "/brand/logo.png", width: 480, height: 328 },
  // Illustration only (two people in speech bubbles).
  illustration: { src: "/brand/illustration.png", width: 353, height: 223 },
} as const;

export function Logo({
  variant = "wordmark",
  height = 24,
  className,
  priority = false,
  decorative = false,
  pill = true,
}: {
  variant?: keyof typeof ASSETS;
  /** Rendered height in px; width follows the artwork's aspect ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
  /** Set when the brand name is already announced nearby (empty alt). */
  decorative?: boolean;
  /** In dark mode, sit the artwork on a light pill so the purple pixel
   *  lettering stays legible (#7c33ff on white = 5.56:1). */
  pill?: boolean;
}) {
  const a = ASSETS[variant];
  const width = Math.round((a.width * height) / a.height);
  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center",
        pill &&
          (variant === "wordmark"
            ? "dark:rounded-full dark:bg-white/95 dark:px-3 dark:py-1.5"
            : "dark:rounded-3xl dark:bg-white/95 dark:p-3"),
      )}
    >
      <Image
        src={a.src}
        alt={decorative ? "" : "SwapSkills"}
        width={width}
        height={height}
        priority={priority}
        // Serve the original file: Next's resize/re-encode (quality 75) blurs
        // the pixel-style lettering. The files are small, so this costs little.
        unoptimized
        className={cn("max-w-full select-none", className)}
        style={{ height, width: "auto" }}
      />
    </span>
  );
}
