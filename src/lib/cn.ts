// Tiny classname joiner (no external dep). Filters falsy values.
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
