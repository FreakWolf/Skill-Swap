import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// Social share card (WhatsApp, X, LinkedIn, Slack, iMessage…). X falls back
// to this og:image too, so no separate twitter-image is needed.
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public/brand/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const domain = SITE.url.replace(/^https?:\/\//, "");
  const { orange, purple, ink } = SITE.colors;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#ffffff",
          backgroundImage: `radial-gradient(circle at 0% 100%, ${orange}22 0%, transparent 45%), radial-gradient(circle at 100% 0%, ${purple}22 0%, transparent 45%)`,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 520, paddingLeft: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={460} height={314} alt="" />
        </div>

        {/* Copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 28,
            flex: 1,
            paddingRight: 72,
            color: ink,
          }}
        >
          <div style={{ fontSize: 64, lineHeight: 1.08, letterSpacing: -1.5 }}>
            Learn anything by teaching what you know
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: "#4b5563" }}>
            Teach a skill to earn credits. Spend them to learn from someone else.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 8 }}>
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                backgroundColor: purple,
                color: "#ffffff",
                fontSize: 26,
              }}
            >
              {SITE.tagline}
            </div>
            <div style={{ fontSize: 26, color: orange }}>{domain}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
