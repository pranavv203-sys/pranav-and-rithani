"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { Car, Mountain, PawPrint, ShoppingBag, UtensilsCrossed, X } from "lucide-react"

export type GemId = "drives" | "parks" | "food" | "paws" | "shopping"

type Gem = {
  id: GemId
  label: string
  memory: string
  Icon: (props: { className?: string }) => ReactNode
}

const GEMS: Record<GemId, Gem> = {
  drives: {
    id: "drives",
    label: "Long drives",
    memory: "No destination required. Give us an open road, a good playlist, and each other.",
    Icon: ({ className }) => <Car className={className} aria-hidden="true" />,
  },
  parks: {
    id: "parks",
    label: "National parks",
    memory: "We collect trails and sunsets. The wilder the park, the happier we are.",
    Icon: ({ className }) => <Mountain className={className} aria-hidden="true" />,
  },
  food: {
    id: "food",
    label: "Good food",
    memory: "Equal parts foodies. If one of us says 'let's just get a snack,' it is never just a snack.",
    Icon: ({ className }) => <UtensilsCrossed className={className} aria-hidden="true" />,
  },
  paws: {
    id: "paws",
    label: "Puppy love",
    memory: "We stop for every dog. Every single one. This is non-negotiable.",
    Icon: ({ className }) => <PawPrint className={className} aria-hidden="true" />,
  },
  shopping: {
    id: "shopping",
    label: "Retail adventures",
    memory: "One of us shops. One of us holds the bags. We will let you guess which is which.",
    Icon: ({ className }) => <ShoppingBag className={className} aria-hidden="true" />,
  },
}

type EggContextValue = {
  found: Set<GemId>
  reveal: (id: GemId) => void
}

const EggContext = createContext<EggContextValue | null>(null)

export function EasterEggProvider({ children }: { children: ReactNode }) {
  const [found, setFound] = useState<Set<GemId>>(new Set())
  const [active, setActive] = useState<GemId | null>(null)

  const reveal = useCallback((id: GemId) => {
    setActive(id)
    setFound((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const value = useMemo(() => ({ found, reveal }), [found, reveal])
  const activeGem = active ? GEMS[active] : null

  return (
    <EggContext.Provider value={value}>
      {children}

      {/* Reveal dialog */}
      {activeGem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gem-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setActive(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-xl animate-fade-up">
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-primary">
              <activeGem.Icon className="h-8 w-8" />
            </div>
            <h3 id="gem-title" className="mt-5 font-serif text-2xl text-foreground">
              {activeGem.label}
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{activeGem.memory}</p>
          </div>
        </div>
      )}
    </EggContext.Provider>
  )
}

export function HiddenGem({ id, className = "" }: { id: GemId; className?: string }) {
  const ctx = useContext(EggContext)
  if (!ctx) return null
  const gem = GEMS[id]
  const isFound = ctx.found.has(id)
  return (
    <button
      type="button"
      onClick={() => ctx.reveal(id)}
      aria-label={`Hidden detail: ${gem.label}`}
      className={`group inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 hover:bg-primary/10 ${
        isFound ? "text-primary opacity-70" : "text-muted-foreground/25 hover:text-primary/70"
      } ${className}`}
    >
      <gem.Icon className="h-4 w-4" />
    </button>
  )
}
