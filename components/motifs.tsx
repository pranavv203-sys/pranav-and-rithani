import Image from "next/image"

export function PrMonogram({ className = "", size = 72 }: { className?: string; size?: number }) {
  // small lotus accent used at the top and bottom of the ring
  const lotus = (cx: number, cy: number, flip: boolean) => (
    <g transform={`translate(${cx} ${cy}) ${flip ? "scale(1 -1)" : ""}`}>
      <path d="M0 0c1.6-4 5-5 5-5s-1 3.6-5 5c-4-1.4-5-5-5-5s3.4 1 5 5z" fill="currentColor" opacity="0.7" />
      <path d="M0 0c3.4-2.6 7.6-1.6 7.6-1.6s-2.8 2.8-7.6 1.6c-4.8 1.2-7.6-1.6-7.6-1.6S-3.4-2.6 0 0z" fill="currentColor" opacity="0.4" />
    </g>
  )
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Monogram of Pranav and Rithani"
    >
      {/* refined double ring */}
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <circle cx="50" cy="50" r="42.5" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.85" />

      {/* lotus accents top & bottom */}
      <g transform="translate(50 9)">{lotus(0, 0, false)}</g>
      <g transform="translate(50 91)">{lotus(0, 0, true)}</g>

      {/* interlocked serif P R sharing the center */}
      <text
        x="41.5"
        y="67"
        textAnchor="middle"
        fontFamily="var(--font-display), Georgia, serif"
        fontSize="56"
        fontWeight="500"
        fill="currentColor"
        style={{ letterSpacing: "0.249em" }}
      >
        P
      </text>
      <text
        x="60"
        y="67"
        textAnchor="middle"
        fontFamily="var(--font-display), Georgia, serif"
        fontSize="56"
        fontWeight="500"
        fill="currentColor"
        style={{ letterSpacing: "-0.166em" }}
      >
        R
      </text>
    </svg>
  )
}

/* Kolam-style dotted divider */
export function KolamDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-10 bg-border sm:w-16" />
      <svg width="90" height="26" viewBox="0 0 90 26" className="text-primary">
        {/* central lotus/kolam knot */}
        <path
          d="M45 4c3 4 8 4 8 9s-5 5-8 9c-3-4-8-4-8-9s5-5 8-9z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          opacity="0.8"
        />
        <circle cx="45" cy="13" r="2" fill="currentColor" />
        {/* looping kolam strokes */}
        <path
          d="M37 13c-6 0-9-5-14-5M53 13c6 0 9-5 14-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.6"
        />
        <circle cx="21" cy="8" r="1.4" fill="currentColor" opacity="0.7" />
        <circle cx="69" cy="8" r="1.4" fill="currentColor" opacity="0.7" />
        <circle cx="12" cy="13" r="1.1" fill="currentColor" opacity="0.5" />
        <circle cx="78" cy="13" r="1.1" fill="currentColor" opacity="0.5" />
      </svg>
      <span className="h-px w-10 bg-border sm:w-16" />
    </div>
  )
}

/* Ornamental gold flourish — symmetrical filigree separator */
export function GoldFlourish({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <svg width="220" height="30" viewBox="0 0 220 30" className="text-primary max-w-full">
        <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          {/* left scroll */}
          <path d="M10 15c30 0 40-9 55-9 12 0 16 7 26 7" opacity="0.85" />
          <path d="M10 15c26 0 38 8 52 8 10 0 14-5 22-5" opacity="0.55" />
          <path d="M65 6c-5-3-11-2-12 3 4 3 10 1 12-3z" opacity="0.7" />
          {/* right scroll (mirror) */}
          <path d="M210 15c-30 0-40-9-55-9-12 0-16 7-26 7" opacity="0.85" />
          <path d="M210 15c-26 0-38 8-52 8-10 0-14-5-22-5" opacity="0.55" />
          <path d="M155 6c5-3 11-2 12 3-4 3-10 1-12-3z" opacity="0.7" />
        </g>
        {/* center diamond + lotus tips */}
        <g fill="currentColor">
          <path d="M110 5l6 10-6 10-6-10z" opacity="0.9" />
          <circle cx="110" cy="15" r="2.2" className="text-background" fill="currentColor" opacity="0.9" />
          <circle cx="96" cy="15" r="1.6" opacity="0.7" />
          <circle cx="124" cy="15" r="1.6" opacity="0.7" />
        </g>
      </svg>
    </div>
  )
}

/* Option A — Mountain range with a rising sun (Colorado / Garden of the Gods nod) */
export function MountainDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-10 bg-border sm:w-16" />
      <svg width="120" height="34" viewBox="0 0 120 34" className="text-primary">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {/* sun */}
          <circle cx="60" cy="11" r="5" strokeWidth="1.2" opacity="0.85" />
          <path d="M60 2v-1M60 22v1M49 11h-1M72 11h1M52 3l-1-1M69 3l1-1" strokeWidth="1" opacity="0.6" />
          {/* peaks */}
          <path d="M20 30l16-16 10 10 8-9 10 12 10-8 16 11" strokeWidth="1.3" opacity="0.85" />
          <path d="M46 24l3.5 3.5M74 27l-4-4" strokeWidth="0.9" opacity="0.5" />
        </g>
      </svg>
      <span className="h-px w-10 bg-border sm:w-16" />
    </div>
  )
}

/* Option B — Mirrored botanical sprigs meeting at a center dot */
export function SprigDivider({ className = "" }: { className?: string }) {
  const sprig = (
    <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <path d="M0 12c10 0 20-1 30-6" opacity="0.85" />
      <path d="M9 11c-1.5-3-1-5-1-5M9 11c2.5-1.5 4.5-1.5 4.5-1.5" opacity="0.6" />
      <path d="M17 9c-1.5-3-1-5.5-1-5.5M17 9c2.5-1.5 5-1.5 5-1.5" opacity="0.6" />
      <path d="M25 6.5c-1-2.5-.5-4.5-.5-4.5M25 6.5c2-1 4-1 4-1" opacity="0.6" />
    </g>
  )
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <svg width="150" height="24" viewBox="0 0 150 24" className="text-primary max-w-full">
        <g transform="translate(45 12) scale(-1 1)">{sprig}</g>
        <g transform="translate(105 12)">{sprig}</g>
        <circle cx="75" cy="12" r="2.4" fill="currentColor" opacity="0.9" />
        <circle cx="75" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
      </svg>
    </div>
  )
}

/* Option C — Minimal hairline rule with a small center diamond */
export function MinimalDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-20 bg-primary/40 sm:w-28" />
      <svg width="16" height="16" viewBox="0 0 16 16" className="text-primary">
        <path d="M8 1l4 7-4 7-4-7z" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
        <circle cx="8" cy="8" r="1.4" fill="currentColor" />
      </svg>
      <span className="h-px w-20 bg-primary/40 sm:w-28" />
    </div>
  )
}

/* Option D — the painted lotus row, used as the section divider.
   The flanking hairlines the SVG version had are gone: they framed a small
   geometric mark, but against the organic painted edges they read as a box
   drawn around a picture. Its paper is colour-matched to --background by
   scripts/build-artwork.mjs, so it sits on the page without a visible edge. */
export function LotusRowDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`} aria-hidden="true">
      <Image
        src="/lotus-vine.webp"
        alt=""
        width={1024}
        height={190}
        sizes="(min-width: 640px) 420px, 300px"
        className="h-auto w-[300px] sm:w-[420px]"
      />
    </div>
  )
}

/* Vel (spear) crossed with a peacock feather — Murugar's symbols */
export function VelPeacock({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Vel and peacock feather, symbols of Lord Murugar"
    >
      {/* Vel spear */}
      <line x1="24" y1="10" x2="24" y2="42" stroke="currentColor" strokeWidth="1.4" opacity="0.8" />
      <path
        d="M24 4c2.4 3 4 5 4 8 0 2.6-1.8 4-4 4s-4-1.4-4-4c0-3 1.6-5 4-8z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Peacock feather eye */}
      <ellipse cx="24" cy="30" rx="7" ry="9" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <ellipse cx="24" cy="30" rx="3.4" ry="4.4" fill="currentColor" opacity="0.25" />
      <circle cx="24" cy="30" r="1.6" fill="currentColor" opacity="0.7" />
    </svg>
  )
}
