import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand/BrandMark";

// Home-screen icon for iPhone/iPad. Full-bleed: iOS rounds the corners itself.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <BrandMark size={180} rounded={false} />
      </div>
    ),
    size,
  );
}
