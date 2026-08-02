"use server"

import { db } from "@/lib/db"
import { rsvps } from "@/lib/db/schema"

export type RsvpResult = { ok: true } | { ok: false; error: string }

export async function submitRsvp(formData: FormData): Promise<RsvpResult> {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()
  const attending = String(formData.get("attending") ?? "yes") === "yes"
  const guestsRaw = Number(formData.get("guests") ?? 1)
  const message = String(formData.get("message") ?? "").trim()

  if (!name) {
    return { ok: false, error: "Please enter your name." }
  }

  const guests = Number.isFinite(guestsRaw) ? Math.min(Math.max(Math.trunc(guestsRaw), 1), 10) : 1

  try {
    await db.insert(rsvps).values({
      name,
      email: email || null,
      phone: phone || null,
      attending,
      guests: attending ? guests : 0,
      message: message || null,
    })
    return { ok: true }
  } catch (e) {
    console.error("RSVP insert failed:", e instanceof Error ? e.message : String(e))
    return { ok: false, error: "Something went wrong. Please try again." }
  }
}
