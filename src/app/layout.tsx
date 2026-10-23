import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TimeZoneSync } from "@/components/TimeZoneSync";
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
  themeColor: SITE.colors.purple,
};

// Run server rendering close to the Supabase DB (Tokyo, ap-northeast-1) to cut
// query latency. hnd1 = Vercel's Tokyo region. Applies to all routes.
export const preferredRegion = ["hnd1"];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TimeZoneSync />
        {children}
      </body>
    </html>
  );
}
