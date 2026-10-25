// Where to send someone after logging in. Only same-site paths are allowed
// ("/credits?pack=pack_525"), never "//evil.com", "/\evil.com" or a full URL,
// so the login page can't be used as an open redirect.
export const DEFAULT_AFTER_LOGIN = "/dashboard";

export function safeNext(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_AFTER_LOGIN;
  const v = value.trim();
  if (v.length === 0 || v.length > 300) return DEFAULT_AFTER_LOGIN;
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return DEFAULT_AFTER_LOGIN;
  // Control characters (including tabs/newlines browsers strip) are never valid here.
  if (/[\u0000-\u001f\u007f]/.test(v)) return DEFAULT_AFTER_LOGIN;
  // Don't bounce back into the auth pages themselves.
  if (/^\/(login|signup)(\/|\?|$)/.test(v)) return DEFAULT_AFTER_LOGIN;
  return v;
}
