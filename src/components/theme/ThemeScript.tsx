import { THEME_COLORS, THEME_STORAGE_KEY } from "@/lib/theme";

// Runs before first paint (first child of <head>), so the page never flashes
// the wrong theme. Same logic as applyTheme() in lib/theme.ts, inlined
// because it must not wait for any bundle. Also marks <html> with `js` so
// scroll-reveal hiding only applies when JavaScript actually runs.
const code = `(function(){var d=document.documentElement;d.classList.add("js");try{var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(p!=="light"&&p!=="dark")p="system";var s=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var r=p==="system"?(s?"dark":"light"):p;d.classList.toggle("dark",r==="dark");d.style.colorScheme=r;d.dataset.theme=p;if(p!=="system"){var c=r==="dark"?${JSON.stringify(
  THEME_COLORS.dark,
)}:${JSON.stringify(THEME_COLORS.light)};document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.content=c})})}}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
