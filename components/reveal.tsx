"use client"

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react"

type RevealProps = {
  children: ReactNode
  /** Element to render. Defaults to a div. */
  as?: ElementType
  /** Delay before the reveal transition begins, in ms. */
  delay?: number
  className?: string
}

/**
 * Fades and rises its children into view the first time they scroll on-screen.
 * Uses IntersectionObserver and reveals once (no re-hiding on scroll up).
 */
export function Reveal({ children, as: Tag = "div", delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || revealed) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [revealed])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-revealed={revealed}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
