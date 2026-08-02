/**
 * Regenerates public/pr-monogram.webp from the painted source artwork.
 *
 * Run with:  node scripts/build-monogram.mjs
 *
 * Why this exists: the source is a photograph/scan of artwork on cream paper,
 * and it carries two problems for the web.
 *
 *  1. The paper is #e1dbcf — darker and greyer than the page background — so
 *     dropping it straight onto the site shows a dull rectangle behind it.
 *  2. The paper is unevenly lit (a vignette: corners darker than the middle),
 *     so a single flat colour correction cannot match it. Correcting to the
 *     corners leaves the middle too light, and vice versa.
 *
 * The fix is a flat-field correction, the standard treatment for uneven
 * illumination: divide the image by a heavily blurred copy of itself. The blur
 * approximates the lighting field, so dividing it out leaves the paper an even
 * white while the artwork keeps its contrast. Sigma is deliberately large (90)
 * — a smaller radius starts including the monogram itself in the "lighting"
 * estimate and washes the art out.
 *
 * The page background is then multiplied back in, so the asset ships already
 * matching the site and needs no CSS blend mode at runtime (a blend mode would
 * also interact with the confetti canvas that sits beneath the hero).
 *
 * NOTE: because the background is baked in, changing --background in
 * globals.css means re-running this with the new value in BG.
 */
import sharp from 'sharp'

const SOURCE = 'assets/pr-logo-source.png'
const OUT = 'public/pr-monogram.webp'

/** --background from app/globals.css, as sRGB. */
const BG = [0xf5, 0xec, 0xd8]

/** Artwork bounds within the source, chosen to exclude the painted names —
 *  the site sets those as live text, so baking them in would duplicate them. */
const CROP = { left: 112, top: 145, width: 606, height: 522 }

/** Blur radius approximating the paper's lighting field. See note above. */
const SIGMA = 90

const base = sharp(SOURCE).extract(CROP).removeAlpha()
const { data, info } = await base.clone().raw().toBuffer({ resolveWithObject: true })
const { data: field } = await base.clone().blur(SIGMA).raw().toBuffer({ resolveWithObject: true })

const { width, height, channels } = info
const out = Buffer.alloc(width * height * 3)

for (let i = 0, j = 0; i < data.length; i += channels, j += 3) {
  for (let c = 0; c < 3; c++) {
    const flattened = Math.min(255, Math.max(0, (data[i + c] / (field[i + c] || 1)) * 255))
    out[j + c] = Math.round((flattened * BG[c]) / 255)
  }
}

const result = await sharp(out, { raw: { width, height, channels: 3 } })
  .webp({ quality: 90 })
  .toFile(OUT)

console.log(`${OUT}  ${result.width}x${result.height}  ${Math.round(result.size / 1024)} KB`)
