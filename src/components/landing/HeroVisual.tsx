import { Clock, Coins, Music } from "lucide-react";
import { Logo } from "@/components/Logo";

/** Two words that cross-fade on a 4s loop (static under reduced motion). */
function Swap({ a, b }: { a: string; b: string }) {
  return (
    <span className="inline-grid">
      <span className="animate-swap-a [grid-area:1/1]">{a}</span>
      <span className="animate-swap-b [grid-area:1/1]">{b}</span>
    </span>
  );
}

/** Decorative hero art built from real UI pieces: the brand illustration,
 *  teach/learn skill chips, a mini offering card and a credit pill.
 *  Pure CSS animation; hidden from assistive tech. */
export function HeroVisual() {
  return (
    <div aria-hidden className="relative mx-auto aspect-[5/4] w-full max-w-md select-none">
      <div className="blob left-6 top-6 h-48 w-48 bg-brand-300/50 dark:bg-brand-600/30" />
      <div className="blob bottom-4 right-4 h-44 w-44 bg-brand-orange-200/70 [animation-delay:-5s] dark:bg-brand-orange-500/20" />

      <div className="absolute inset-x-6 top-[14%] flex justify-center">
        <div className="glass rounded-[2rem] p-4">
          <Logo variant="illustration" height={150} decorative priority className="max-w-[60vw]" />
        </div>
      </div>

      {/* Teach chip */}
      <div className="animate-float absolute left-0 top-[4%] sm:-left-4">
        <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          I teach <span className="text-link"><Swap a="Guitar" b="Python" /></span>
        </span>
      </div>

      {/* Learn chip */}
      <div className="animate-float absolute right-0 top-[30%] [animation-delay:-2s] sm:-right-4">
        <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full bg-brand-orange-500" />
          I want to learn <span className="text-accent-fg"><Swap a="Python" b="Guitar" /></span>
        </span>
      </div>

      {/* Mini offering card */}
      <div className="animate-float absolute bottom-0 left-2 w-60 [animation-delay:-4s] sm:left-0">
        <div className="rounded-3xl border border-border bg-card-solid p-4 shadow-lift">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-soft-fg">
            <Music className="h-3 w-3" /> Music
          </span>
          <p className="mt-2 text-sm font-bold leading-snug text-foreground">Beginner guitar, first chords</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> 60 min
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent-fg">
              <Coins className="h-3.5 w-3.5" /> 1 credit
            </span>
          </div>
        </div>
      </div>

      {/* Earned credit */}
      <div className="absolute bottom-[18%] right-2 sm:right-0">
        <span className="animate-pop bg-gradient-accent inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold text-ink shadow-glow-orange">
          <Coins className="h-4 w-4" /> +1 credit
        </span>
      </div>
    </div>
  );
}
