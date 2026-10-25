"use client";

import { useEffect } from "react";
import { reapplyStoredTheme, THEME_STORAGE_KEY } from "@/lib/theme";

// Keeps the applied theme in sync with the OS setting (when the preference is
// "System") and with changes made in other tabs. Renders nothing.
export function ThemeSync() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => reapplyStoredTheme();
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) reapplyStoredTheme();
    };
    // Metas are rendered after the head script ran: sync them once.
    reapplyStoredTheme();
    mq.addEventListener("change", onSystem);
    window.addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener("change", onSystem);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return null;
}
