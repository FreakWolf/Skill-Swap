// Brand + site details used by metadata, share images, robots and sitemap.
// Set NEXT_PUBLIC_SITE_URL to override (e.g. for a future domain).
export const SITE = {
  name: "SkillSwap",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapskills.dpdns.org").replace(/\/$/, ""),
  title: "SkillSwap — Trade skills, not cash",
  tagline: "Trade skills, not cash",
  description:
    "SkillSwap is a peer-to-peer skill exchange. Teach what you know to earn credits, then spend them to learn something new from someone else.",
  // Brand colors (match the dashboard hero gradient).
  colors: { blue: "#2563eb", purple: "#9333ea" },
};
