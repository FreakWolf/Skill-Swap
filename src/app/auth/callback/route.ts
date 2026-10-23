import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for links in Supabase auth emails (signup confirmation and
// password reset). Exchanges the one-time `code` for a session cookie, then
// forwards the user to `next`.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Only allow same-site relative paths, to prevent open redirects.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Missing/expired/invalid link.
  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}
