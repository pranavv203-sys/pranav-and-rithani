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

// Warm metallics + silver. Each has a light and dark stop for a shiny sheen.
const METALS: Metal[] = [
  { light: "#e6c86b", dark: "#b5891f" }, // gold
  { light: "#f0d98a", dark: "#c9a227" }, // bright gold
  { light: "#e9e9ee", dark: "#a9afb8" }, // silver
  { light: "#f4f5f7", dark: "#c2c7cf" }, // bright silver
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

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
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
      }
    }

    const count = Math.round(Math.min(46, Math.max(24, (width * height) / 26000)))
    const particles: Particle[] = Array.from({ length: count }, () => spawn(true))

    const pointer = { x: width / 2, y: height / 2, tx: width / 2, ty: height / 2, active: false }
    const onPointer = (e: PointerEvent) => {
      pointer.tx = e.clientX
      pointer.ty = e.clientY
      pointer.active = true
    }
    window.addEventListener("pointermove", onPointer, { passive: true })

    let lastScroll = window.scrollY
    let scrollFlow = 0
    const onScroll = () => {
      const y = window.scrollY
      scrollFlow += (y - lastScroll) * 0.06
      scrollFlow = Math.max(-14, Math.min(14, scrollFlow))
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

      const shimmer = 0.5 + 0.25 * Math.sin(p.rotY)
      const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2)
      grad.addColorStop(0, p.metal.light)
      grad.addColorStop(Math.max(0.05, Math.min(0.95, shimmer)), p.metal.dark)
      grad.addColorStop(1, p.metal.light)
      ctx.fillStyle = grad
      ctx.strokeStyle = grad

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
