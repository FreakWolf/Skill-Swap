import type { Metadata } from "next";
import { PrivacyContent } from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy — SkillSwap",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
