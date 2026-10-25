// Light / Dark / System colour theme. No React here: ThemeScript inlines the
// same logic so the right theme is applied before first paint.

export const THEME_STORAGE_KEY = "skillswap-theme";
export const THEME_EVENT = "skillswap-theme-change";

export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: "#f7f4ff",
  dark: "#0f0a1f",
};

export function parseThemePref(raw: unknown): ThemePref {
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

export function resolveTheme(pref: ThemePref, systemDark: boolean): ResolvedTheme {
  if (pref === "system") return systemDark ? "dark" : "light";
  return pref;
}

function systemPrefersDark(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function readPref(): ThemePref {
  try {
    return parseThemePref(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

/** Applies a preference to <html>: `dark` class, color-scheme, data-theme and
 *  the browser UI colour (theme-color metas). */
export function applyTheme(pref: ThemePref): void {
  const root = document.documentElement;
  const resolved = resolveTheme(pref, systemPrefersDark());
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  root.dataset.theme = pref;
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  metas.forEach((m) => {
    if (pref === "system") {
      const media = m.getAttribute("media") ?? "";
      m.content = media.includes("dark") ? THEME_COLORS.dark : THEME_COLORS.light;
    } else {
      m.content = THEME_COLORS[resolved];
    }
  });
}

export function setThemePref(pref: ThemePref): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Private mode / storage disabled: still apply for this page view.
  }
  applyTheme(pref);
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** For useSyncExternalStore: notifies on in-tab changes and other tabs. */
export function subscribeThemePref(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) cb();
  };
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function getThemePrefSnapshot(): ThemePref {
  return readPref();
}

/** Re-applies the stored preference (OS theme change, other tab). */
export function reapplyStoredTheme(): void {
  applyTheme(readPref());
}
