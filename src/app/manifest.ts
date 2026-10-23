import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Lets people "Add to Home Screen" and get an app-like icon + name.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: SITE.colors.purple,
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
