import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand/BrandMark";
import { SITE } from "@/lib/site";

// Social share card (WhatsApp, X, LinkedIn, Slack, iMessage…). X falls back
// to this og:image too, so no separate twitter-image is needed.
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const domain = SITE.url.replace(/^https?:\/\//, "");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "white",
          backgroundImage: `linear-gradient(135deg, ${SITE.colors.blue} 0%, ${SITE.colors.purple} 100%)`,
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              borderRadius: 22,
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
              border: "3px solid rgba(255,255,255,0.35)",
            }}
          >
            <BrandMark size={88} />
          </div>
          <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: -1 }}>{SITE.name}</div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>
            Learn anything by teaching what you know
          </div>
          <div style={{ fontSize: 32, opacity: 0.9, maxWidth: 940, lineHeight: 1.35 }}>
            Teach a skill to earn credits. Spend them to learn from someone else. No cash needed.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28 }}>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.18)",
              fontWeight: 600,
            }}
          >
            {SITE.tagline}
          </div>
          <div style={{ opacity: 0.85 }}>{domain}</div>
        </div>
      </div>
    ),
    size,
  );
}
