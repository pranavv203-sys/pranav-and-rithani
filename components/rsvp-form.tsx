"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { Heart } from "lucide-react"

/**
 * Replies go to a Google Apps Script web app, which appends them to a Sheet.
 * See scripts/rsvp-sheet.gs for the script and its setup steps.
 *
 * The endpoint is injected at build time from the RSVP_ENDPOINT repository
 * variable. While it is unset the form still renders but reports that replies
 * are not open, so the site is never showing a form that silently discards
 * what people type.
 *
 * (The original Postgres path — app/actions/rsvp.ts and lib/db — is still in
 * the repo. It cannot be used from a static export, since Server Actions need
 * a Node runtime.)
 */
const ENDPOINT = process.env.NEXT_PUBLIC_RSVP_ENDPOINT ?? ""

export function RsvpForm() {
  const [isPending, startTransition] = useTransition()
  const [attending, setAttending] = useState<"yes" | "no">("yes")
  const [status, setStatus] = useState<"idle" | "success" | "error" | "closed">("idle")
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!ENDPOINT) {
      // Deliberately NOT the success screen. A guest who sees "thank you" and
      // has not actually been recorded is worse off than one who is told
      // plainly that replies are not open — they would never come back.
      setStatus("closed")
      return
    }

    const form = new FormData(e.currentTarget)
    const payload = Object.fromEntries(form.entries())

    startTransition(async () => {
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          // text/plain keeps this a "simple" cross-origin request, so the
          // browser skips the preflight. Apps Script does not answer OPTIONS,
          // so sending application/json here would fail CORS before the
          // request ever reached Google.
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
          redirect: "follow",
        })
        const result = await res.json()
        if (result.ok) {
          setStatus("success")
        } else {
          setStatus("error")
          setError(result.error || "Something went wrong. Please try again.")
        }
      } catch {
        setStatus("error")
        setError("We couldn't reach the server. Please check your connection and try again.")
      }
    })
  }

  if (status === "closed") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-10 text-center shadow-sm">
        <h3 className="font-serif text-2xl text-foreground">Replies aren&apos;t open yet</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          We&apos;re still setting this up, so nothing has been sent. Please check back shortly and
          we&apos;ll be delighted to hear from you.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium uppercase tracking-[0.15em] text-accent underline underline-offset-4"
        >
          Back to the form
        </button>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <Heart className="h-6 w-6 text-accent" aria-hidden="true" />
        </div>
        <h3 className="font-serif text-3xl text-foreground">Thank you!</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {attending === "yes"
            ? "We're overjoyed you'll be joining us. Your response has been received."
            : "Thank you for letting us know. You'll be missed dearly."}
        </p>
      </div>
    )
  }

  const inputClass =
    "w-full rounded-md border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5 text-left">
      {/* Honeypot. Hidden from people, and skipped by keyboard and screen
          readers, but naive bots fill every field they find. The script treats
          any submission carrying this as spam. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
          Full name
        </label>
        <input id="name" name="name" type="text" required placeholder="Your name" className={inputClass} />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email <span className="text-muted-foreground">(optional)</span>
        </label>
        <input id="email" name="email" type="email" placeholder="you@example.com" className={inputClass} />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
          Phone <span className="text-muted-foreground">(optional)</span>
        </label>
        <input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" className={inputClass} />
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-foreground">Will you attend?</legend>
        <div className="flex flex-col gap-3 sm:flex-row">
          {(["yes", "no"] as const).map((value) => (
            <label
              key={value}
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border px-4 py-3 text-center text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-ring/40 ${
                attending === value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-input bg-background text-foreground hover:border-accent"
              }`}
            >
              <input
                type="radio"
                name="attending"
                value={value}
                checked={attending === value}
                onChange={() => setAttending(value)}
                className="sr-only"
              />
              {value === "yes" ? "Joyfully accept — we can't wait to see you!" : "Regretfully decline — we'll miss you"}
            </label>
          ))}
        </div>
      </fieldset>

      {attending === "yes" && (
        <div>
          <label htmlFor="guests" className="mb-1.5 block text-sm font-medium text-foreground">
            Number of guests (including you)
          </label>
          <input
            id="guests"
            name="guests"
            type="number"
            min={1}
            max={10}
            defaultValue={1}
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
          A note for the couple <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="Send your blessings and wishes..."
          className={inputClass}
        />
      </div>

      {status === "error" && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-accent px-6 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Sending..." : "Send RSVP"}
      </button>
    </form>
  )
}
