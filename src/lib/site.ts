// Brand + site details used by metadata, share images, robots and sitemap.
// Set NEXT_PUBLIC_SITE_URL to override (e.g. for a future domain).
export const SITE = {
  name: "SkillSwap",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapskills.dpdns.org").replace(/\/$/, ""),
  title: "SkillSwap — Trade skills, not cash",
  tagline: "Trade skills, not cash",
  description:
    "SkillSwap is a peer-to-peer skill exchange. Teach what you know to earn credits, then spend them to learn something new from someone else.",
  // Brand colours sampled from public/brand/logo.png.
  colors: { orange: "#ff8033", purple: "#7c33ff", ink: "#1f1147" },
};
