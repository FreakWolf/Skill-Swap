import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Public marketing/legal pages are indexable; everything behind login isn't
// (those pages also send noindex, and redirect to /login for crawlers anyway).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/pricing", "/faq", "/contact", "/signup", "/login", "/terms", "/privacy"],
      disallow: [
        "/auth/",
        "/onboarding/",
        "/forgot-password",
        "/reset-password",
        "/dashboard",
        "/marketplace",
        "/offer",
        "/offerings/",
        "/sessions",
        "/calendar",
        "/availability",
        "/messages",
        "/notifications",
        "/analytics",
        "/credits",
        "/saved",
        "/admin",
        "/api/",
        "/profile",
        "/settings",
        "/u/",
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
