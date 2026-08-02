"use client"

import { useEffect, useState } from "react"

type Item = {
  left: number
  size: number
  delay: number
  duration: number
  drift: number
  hue: string
  kind: "flower" | "leaf"
}

// terracotta + ivory palette
const HUES = ["oklch(0.55 0.13 42)", "oklch(0.68 0.11 48)", "oklch(0.9 0.03 78)", "oklch(0.78 0.07 55)"]

function Flower({ hue }: { hue: string }) {
  return (
    <svg viewBox="0 0 20 20" width="100%" height="100%">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx="10"
          cy="5"
          rx="2.6"
          ry="4.4"
          fill={hue}
          opacity="0.85"
          transform={`rotate(${a} 10 10)`}
        />
      ))}
      <circle cx="10" cy="10" r="2" fill="oklch(0.85 0.05 90)" opacity="0.9" />
    </svg>
  )
}

function Leaf({ hue }: { hue: string }) {
  return (
    <svg viewBox="0 0 20 20" width="100%" height="100%">
      <path d="M4 16C4 8 10 3 16 3c0 8-6 13-12 13z" fill={hue} opacity="0.8" />
      <path d="M6 14C8 9 12 6 15 5" stroke="oklch(0.42 0.1 45)" strokeWidth="0.7" fill="none" opacity="0.7" />
    </svg>
  )
}

export function FallingPetals({ count = 14 }: { count?: number }) {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    setItems(
      Array.from({ length: count }).map((_, i) => ({
        left: Math.random() * 100,
        size: 12 + Math.random() * 14,
        delay: Math.random() * 12,
        duration: 10 + Math.random() * 10,
        drift: (Math.random() - 0.5) * 160,
        hue: HUES[i % HUES.length],
        kind: i % 3 === 0 ? "leaf" : "flower",
      })),
    )
  }, [count])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {items.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            // @ts-expect-error custom property
            "--drift": `${p.drift}px`,
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.kind === "flower" ? <Flower hue={p.hue} /> : <Leaf hue={p.hue} />}
        </span>
      ))}
    </div>
  )
}
