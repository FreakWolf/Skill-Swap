// The SkillSwap swap-arrows mark as plain JSX SVG, for generated images
// (apple-icon, social share card). Keep in sync with src/app/icon.svg.
export function BrandMark({ size, rounded = true }: { size: number; rounded?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx={rounded ? 14 : 0} fill="url(#g)" />
      <g fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22h31" />
        <path d="M38 14l8 8-8 8" />
        <path d="M49 42H18" />
        <path d="M26 34l-8 8 8 8" />
      </g>
    </svg>
  );
}
