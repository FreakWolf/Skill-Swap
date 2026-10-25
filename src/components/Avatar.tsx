import { cn } from "@/lib/cn";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Avatar({
  name,
  url,
  size = 40,
  className,
}: {
  name: string;
  url?: string | null;
  size?: number;
  className?: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-white/60 dark:ring-white/10", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn(
        // Gradient initials fallback, matching the reference aesthetic.
        "bg-gradient-hero inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white/60 dark:ring-white/10",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={name}
    >
      {initials(name || "?")}
    </span>
  );
}
