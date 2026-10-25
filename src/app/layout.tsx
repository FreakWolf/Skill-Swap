import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TimeZoneSync } from "@/components/TimeZoneSync";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { ThemeSync } from "@/components/theme/ThemeSync";
import { SITE } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Absolute base for share-image and canonical URLs.
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    // Pages set just their own name, e.g. "Explore" -> "Explore · SkillSwap".
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "skill exchange",
    "skill swap",
    "learn skills",
    "teach skills",
    "peer to peer learning",
    "time bank",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  appleWebApp: {
    title: SITE.name,
    capable: true,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // Browser UI colour follows the theme (ThemeScript/applyTheme override it
  // when the user picks Light or Dark explicitly).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0a1f" },
  ],
};

// Run server rendering close to the Supabase DB (Tokyo, ap-northeast-1) to cut
// query latency. hnd1 = Vercel's Tokyo region. Applies to all routes.
export const preferredRegion = ["hnd1"];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // ThemeScript adds the `dark`/`js` classes before hydration.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
        {/* Without JS nothing may stay hidden behind a scroll reveal. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="bg-ambient flex min-h-full flex-col text-foreground">
        <TimeZoneSync />
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
