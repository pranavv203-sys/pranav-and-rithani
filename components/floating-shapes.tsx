"use client"

import { useEffect, useRef } from "react"

/**
 * Canvas-based floating confetti/foliage layer.
 * Particles are metallic slivers, diamonds, squares and thin strokes in gold,
 * silver, tan, olive and rose. They tumble and drift generally upward, lean
 * toward the mouse pointer, and their overall flow speeds up / reverses with
 * scroll velocity.
 */

type Metal = { light: string; dark: string }

// Warm metallics only. Each has a light and dark stop for a shiny sheen.
// (Cool silver read as grey against the beige ground, so the two silver
// entries became champagne and pearl — same light-catching range, warm.)
const METALS: Metal[] = [
  { light: "#e6c86b", dark: "#b5891f" }, // gold
  { light: "#f0d98a", dark: "#c9a227" }, // bright gold
  { light: "#efe7d6", dark: "#b8a888" }, // champagne
  { light: "#f7f1e3", dark: "#cbbda1" }, // pearl
  { light: "#d8c39a", dark: "#a8864a" }, // tan
  { light: "#9a8654", dark: "#5f4d24" }, // olive/espresso
  { light: "#d9a7b0", dark: "#b47a8a" }, // dusty rose
]

type Kind = "leaf" | "diamond" | "square" | "streak" | "rect"
const KINDS: Kind[] = ["leaf", "diamond", "square", "streak", "rect", "leaf", "diamond"]

interface Particle {
  x: number
  y: number
  size: number
  ratio: number
  rot: number // z-axis
  spin: number // z-axis speed
  rotX: number
  rotY: number
  spinX: number
  spinY: number
  vx: number
  vy: number
  swayPhase: number
  swayAmp: number
  swaySpeed: number
  depth: number
  opacity: number
  metal: Metal
  kind: Kind
  // Cached sheen gradient, rebuilt only when the shimmer bucket changes.
  grad: CanvasGradient | null
  gradKey: number
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function FloatingShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Touch devices get a lighter treatment throughout: fewer pixels, fewer
    // particles, no pointer lean. Keyed off pointer type rather than width so
    // a small desktop window keeps the full effect.
    const finePointer = window.matchMedia("(pointer: fine)").matches

    let width = 0
    let height = 0
    let dpr = 1

    // Extra canvas height beyond the viewport. Mobile browsers grow and shrink
    // innerHeight as the URL bar hides and shows while scrolling; drawing into
    // that slack means those changes never require a resize, and the canvas
    // still covers the screen at its tallest.
    const SLACK = 160

    let lastW = -1
    let lastVH = -1

    const resize = () => {
      const w = window.innerWidth
      const vh = window.innerHeight

      // Reassigning canvas.width/height RESETS the context — it clears the
      // frame and drops the transform. Mobile fires resize on every URL-bar
      // movement, so honouring those events reset the canvas mid-animation
      // and made the whole field flicker and jump while scrolling. That was
      // the jitter. Only react to a width change or a height change too large
      // to be the URL bar.
      if (w === lastW && Math.abs(vh - lastVH) <= SLACK) return
      lastW = w
      lastVH = vh

      // Phones are commonly DPR 3. Capping lower cuts the pixels painted per
      // frame by more than half, which the particles do not visibly suffer for.
      dpr = Math.min(window.devicePixelRatio || 1, finePointer ? 2 : 1.5)
      width = w
      height = vh + SLACK
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // Weighted size tiers: 20% big, 50% medium, 20% small, 10% tiny.
    const tierScale = () => {
      const r = Math.random()
      if (r < 0.2) return rand(1.7, 2.4) // big
      if (r < 0.7) return rand(1.0, 1.5) // medium
      if (r < 0.9) return rand(0.6, 0.85) // small
      return rand(0.35, 0.5) // tiny
    }

    function spawn(initial: boolean): Particle {
      const kind = pick(KINDS)
      // Weighted size tiers apply to every kind so all elements range from
      // tiny to large. Global 2.1x scale-up makes the whole field bigger.
      const base = kind === "streak" ? rand(14, 22) : kind === "leaf" ? rand(16, 26) : rand(8, 13)
      const size = base * tierScale() * 2.1
      return {
        x: rand(0, width),
        // Bottom -> up flow: start at (or below) the bottom edge, then rise.
        y: initial ? rand(0, height) : rand(height + 10, height + 40),
        size,
        ratio: kind === "rect" ? rand(1.6, 3) : 1,
        rot: rand(0, Math.PI * 2),
        spin: rand(-0.012, 0.012),
        rotX: rand(0, Math.PI * 2),
        rotY: rand(0, Math.PI * 2),
        spinX: rand(-0.02, 0.02),
        spinY: rand(-0.02, 0.02),
        vx: rand(-0.18, 0.18),
        vy: rand(-0.32, -0.1), // negative = upward, slow
        swayPhase: rand(0, Math.PI * 2),
        swayAmp: rand(16, 42), // wider lateral float
        swaySpeed: rand(0.004, 0.011),
        depth: rand(0.3, 1),
        opacity: rand(0.45, 0.9),
        metal: pick(METALS),
        kind,
        grad: null,
        gradKey: -1,
      }
    }

    const maxCount = finePointer ? 46 : 26
    const minCount = finePointer ? 24 : 14
    const count = Math.round(
      Math.min(maxCount, Math.max(minCount, (width * height) / 26000)),
    )
    const particles: Particle[] = Array.from({ length: count }, () => spawn(true))

    const pointer = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2, active: false }
    const onPointer = (e: PointerEvent) => {
      pointer.tx = e.clientX
      pointer.ty = e.clientY
      pointer.active = true
    }
    // Touch only: pointermove fires in bursts as a finger drags to scroll, so
    // the lean target jumped straight to wherever the finger landed and the
    // entire field lurched sideways by up to 70px on every swipe. A mouse
    // moves continuously, so the same code reads as smooth parallax there.
    if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true })

    let lastScroll = window.scrollY
    let scrollFlow = 0
    // Momentum scrolling on touch delivers much larger jumps in scrollY between
    // frames than a wheel does, so the same coefficients made the field lurch.
    const flowGain = finePointer ? 0.06 : 0.03
    const flowCap = finePointer ? 14 : 7
    const onScroll = () => {
      const y = window.scrollY
      scrollFlow += (y - lastScroll) * flowGain
      scrollFlow = Math.max(-flowCap, Math.min(flowCap, scrollFlow))
      lastScroll = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", resize)

    const drawParticle = (p: Particle, leanX = 0, leanY = 0) => {
      ctx.save()
      ctx.translate(p.x + leanX * p.depth, p.y + leanY * p.depth)
      ctx.rotate(p.rot) // z-axis spin
      // Simulate x/y-axis tumbling: foreshorten by the cosine of each angle so
      // the shape appears to flip through 3D (and mirrors when cosine goes negative).
      const sx = Math.cos(p.rotY)
      const sy = Math.cos(p.rotX)
      ctx.scale(sx || 0.0001, sy || 0.0001)
      // Sheen shifts with the y-rotation so the metal catches the "light".
      ctx.globalAlpha = p.opacity * (0.55 + 0.45 * Math.abs(sx * sy))

      const w = p.kind === "rect" ? p.size * p.ratio : p.kind === "leaf" ? p.size * 0.62 : p.size
      const h = p.size

      // Gradients were rebuilt for every particle on every frame — with 46
      // particles at 60fps that is ~2,800 gradient allocations a second, by
      // far the most expensive thing in the loop and the source of the low
      // frame rate on phones. The geometry is fixed per particle and only the
      // dark stop moves, so quantise the shimmer into 12 steps and rebuild
      // only when a particle crosses into the next one. Gradient coordinates
      // are resolved against the transform at paint time, so a cached one
      // stays correct as the particle moves.
      const shimmer = 0.5 + 0.25 * Math.sin(p.rotY)
      const bucket = Math.round(Math.max(0.05, Math.min(0.95, shimmer)) * 12)
      if (!p.grad || p.gradKey !== bucket) {
        const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2)
        grad.addColorStop(0, p.metal.light)
        grad.addColorStop(Math.max(0.05, Math.min(0.95, bucket / 12)), p.metal.dark)
        grad.addColorStop(1, p.metal.light)
        p.grad = grad
        p.gradKey = bucket
      }
      ctx.fillStyle = p.grad
      ctx.strokeStyle = p.grad

      switch (p.kind) {
        case "leaf":
          // pointed leaf: two mirrored quadratic curves + a midrib vein
          ctx.beginPath()
          ctx.moveTo(0, -h / 2)
          ctx.quadraticCurveTo(w / 2, 0, 0, h / 2)
          ctx.quadraticCurveTo(-w / 2, 0, 0, -h / 2)
          ctx.closePath()
          ctx.fill()
          ctx.globalAlpha *= 0.5
          ctx.lineWidth = Math.max(0.5, w * 0.08)
          ctx.beginPath()
          ctx.moveTo(0, -h / 2)
          ctx.lineTo(0, h / 2)
          ctx.stroke()
          break
        case "diamond":
          ctx.beginPath()
          ctx.moveTo(0, -h / 2)
          ctx.lineTo(w / 2, 0)
          ctx.lineTo(0, h / 2)
          ctx.lineTo(-w / 2, 0)
          ctx.closePath()
          ctx.fill()
          break
        case "square":
          ctx.fillRect(-w / 2, -h / 2, w, h)
          break
        case "rect":
          ctx.fillRect(-w / 2, -h / 4, w, h / 2)
          break
        case "streak":
          ctx.lineWidth = 1.4
          ctx.lineCap = "round"
          ctx.beginPath()
          ctx.moveTo(-w / 2, 0)
          ctx.lineTo(w / 2, 0)
          ctx.stroke()
          break
      }
      ctx.restore()
    }

    let raf = 0
    const tick = () => {
      ctx.clearRect(0, 0, width, height)
      pointer.x += (pointer.tx - pointer.x) * 0.08
      pointer.y += (pointer.ty - pointer.y) * 0.08
      scrollFlow *= 0.92

      // The whole field gently drifts ALONG with the pointer (parallax by depth):
      // closer particles shift more, farther ones less. No gathering/attraction.
      const leanX = pointer.active ? ((pointer.x - width / 2) / (width / 2)) * 70 : 0
      const leanY = pointer.active ? ((pointer.y - height / 2) / (height / 2)) * 70 : 0

      for (const p of particles) {
        p.swayPhase += p.swaySpeed
        const sway = Math.sin(p.swayPhase) * p.swayAmp * 0.02
        const flow = scrollFlow * p.depth
        p.x += p.vx + sway
        p.y += p.vy + flow
        p.rot += p.spin
        p.rotX += p.spinX
        p.rotY += p.spinY

        if (p.y < -60) Object.assign(p, spawn(false))
        else if (p.y > height + 60) p.y = -40
        if (p.x < -60) p.x = width + 40
        else if (p.x > width + 60) p.x = -40

        drawParticle(p, leanX, leanY)
      }
      raf = requestAnimationFrame(tick)
    }

    if (!reduce) raf = requestAnimationFrame(tick)
    else for (const p of particles) drawParticle(p)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onPointer)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 5 }}
    />
  )
}
