"use client"

import { useEffect, useState } from "react"

const TARGET = new Date("2026-09-17T09:00:00-04:00").getTime()

function getRemaining() {
  const diff = Math.max(0, TARGET - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function Countdown() {
  const [time, setTime] = useState<ReturnType<typeof getRemaining> | null>(null)

  useEffect(() => {
    setTime(getRemaining())
    const id = setInterval(() => setTime(getRemaining()), 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { label: "Days", value: time?.days },
    { label: "Hours", value: time?.hours },
    { label: "Minutes", value: time?.minutes },
    { label: "Seconds", value: time?.seconds },
  ]

  return (
    <div className="flex items-start justify-center">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-start">
          <div className="flex min-w-16 flex-col items-center px-3 sm:min-w-24 sm:px-5">
            <span className="font-serif text-5xl font-medium tabular-nums leading-none text-primary sm:text-7xl">
              {u.value === undefined ? "--" : String(u.value).padStart(2, "0")}
            </span>
            <span className="mt-3 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground sm:text-xs">
              {u.label}
            </span>
          </div>
          {i < units.length - 1 && <span className="h-14 w-px bg-border sm:h-20" aria-hidden="true" />}
        </div>
      ))}
    </div>
  )
}
