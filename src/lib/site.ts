// Brand + site details used by metadata, share images, robots and sitemap.
// Set NEXT_PUBLIC_SITE_URL to override (e.g. for a future domain).
export const SITE = {
  name: "SwapSkills",
  // Other names for the site, for Google's site name (the brand was called
  // SkillSwap before Oct 2026).
  alternateNames: ["Swap Skills", "SkillSwap"],
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://swapskills.dpdns.org").replace(/\/$/, ""),
  title: "SwapSkills — Trade skills, not cash",
  tagline: "Trade skills, not cash",
  description:
    "SwapSkills is a peer-to-peer skill exchange. Teach what you know to earn credits, then spend them to learn something new from someone else.",
  // Brand colours sampled from public/brand/logo.png.
  colors: { orange: "#ff8033", purple: "#7c33ff", ink: "#1f1147" },
};
