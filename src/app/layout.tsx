import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TimeZoneSync } from "@/components/TimeZoneSync";
import { SITE } from "@/lib/site";
import { THEME_COLORS, THEME_INIT_SCRIPT } from "@/lib/theme";

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
  // Both themes are declared; the pre-paint script and the toggle also keep
  // the plain (no-media) tag below in sync with a manual choice.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
  colorScheme: "light dark",
};

// Run server rendering close to the Supabase DB (Tokyo, ap-northeast-1) to cut
// query latency. hnd1 = Vercel's Tokyo region. Applies to all routes.
export const preferredRegion = ["hnd1"];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the inline script adds the `dark` class before
    // React hydrates, which is expected to differ from the server markup.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content={THEME_COLORS.light} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TimeZoneSync />
        {children}
      </body>
    </html>
  );
}
