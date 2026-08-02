/**
 * Regenerates the painted artwork assets in public/ from the sources in assets/.
 *
 * Run with:  node scripts/build-artwork.mjs
 *
 * Why this exists: the sources are photographs/scans of artwork on cream paper,
 * which carries two problems for the web.
 *
 *  1. The paper is around #e1dbcf — darker and greyer than the page background
 *     — so dropping it straight onto the site shows a dull rectangle behind it.
 *  2. The paper is unevenly lit (a vignette: corners darker than the middle),
 *     so a single flat colour correction cannot match it. Correcting to the
 *     corners leaves the middle too light, and vice versa.
 *
 * The fix is a flat-field correction, the standard treatment for uneven
 * illumination: divide the image by a heavily blurred copy of itself. The blur
 * approximates the lighting field, so dividing it out leaves the paper an even
 * white while the artwork keeps its contrast. SIGMA is deliberately large — a
 * smaller radius starts including the artwork itself in the "lighting" estimate
 * and washes it out.
 *
 * The page background is then multiplied back in, so each asset ships already
 * matching the site and needs no CSS blend mode at runtime (a blend mode would
 * also interact with the confetti canvas that sits beneath the hero).
 *
 * NOTE: because the background is baked in, changing --background in
 * globals.css means re-running this with the new value in BG.
 */
import sharp from 'sharp'

/** Surface colours from app/globals.css, as sRGB. Each asset bakes in the
 *  colour of the surface it will sit on — a divider dropped on --card with
 *  --background baked in shows up as a darker rectangle, and vice versa. */
const SURFACE = {
  background: [0xf5, 0xec, 0xd8],
  card: [0xfa, 0xf4, 0xe6],
}

/** Blur radius approximating the paper's lighting field. See note above. */
const SIGMA = 90

/**
 * maxWidth caps each export at roughly 2x its largest on-page display width.
 * This matters because the static export runs with images.unoptimized — there
 * is no optimizer to resize on the fly, so whatever is exported here is what
 * every device downloads. 2x keeps retina screens sharp without shipping the
 * full source to a phone. If the site later moves to a host with the Next
 * optimizer, drop these and let it generate per-width variants instead.
 */
const ASSETS = [
  {
    source: 'assets/pr-logo-source.png',
    out: 'public/pr-monogram.webp',
    surface: 'background',
    // Displayed at up to 340px. Source crops to 605px, which is below 2x
    // (680px) — so this is left at native size, the most detail available.
    maxWidth: null,
    // Excludes the painted names — the site sets those as live text, so baking
    // them in would show the names twice in two different typefaces.
    //
    // Bounds are set so the painted content reads as centred. Note this aligns
    // the OPTICAL centre (ink-weighted centroid), not the bounding box: the
    // composition carries more weight on the right (lotus stem, nadaswaram)
    // than on the left (thin palm fronds), so a box-centred crop still looked
    // shifted right by ~12px. Margins are deliberately uneven — 31px left,
    // 56px right — which is what puts the visual mass on the centre line.
    crop: { left: 142, top: 175, width: 605, height: 490 },
  },
  {
    source: 'assets/lotus-vine-source.png',
    out: 'public/lotus-vine.webp',
    surface: 'background',
    // The vine runs edge to edge, so the crop keeps the full width and trims
    // only the empty paper above and below the band.
    crop: { left: 0, top: 145, width: 1024, height: 190 },
    maxWidth: 480, // displayed at up to 240px
  },
  {
    // Same vine, baked for --card. The Schedule section is the one place a
    // divider sits on a card surface.
    source: 'assets/lotus-vine-source.png',
    out: 'public/lotus-vine-card.webp',
    surface: 'card',
    crop: { left: 0, top: 145, width: 1024, height: 190 },
    maxWidth: 480, // displayed at up to 240px
  },
  {
    // Lotus leaves hanging into the top-left of the When & Where section,
    // which is bg-background.
    //
    // top is deliberately 0: the stems run off the top edge of the source, and
    // keeping that intact is what makes the cluster read as dropping in from
    // above rather than floating. Bounds found by isolating green pixels
    // (g > b, darker than paper) — the usual paper-vs-ink threshold failed
    // here because this source has a much stronger paper texture.
    source: 'assets/lotus-leaf-source.png',
    out: 'public/lotus-leaf.webp',
    surface: 'background',
    crop: { left: 228, top: 0, width: 472, height: 1056 },
    maxWidth: 190, // displayed at up to 95px
  },
  {
    // Banana tree in the corner of the Schedule section, which is bg-card.
    // Bounds come from ink column/row profiles rather than a single-pixel
    // bounding box — the paper's edge noise otherwise reads as content.
    source: 'assets/banana-tree-source.png',
    out: 'public/banana-tree-card.webp',
    surface: 'card',
    crop: { left: 106, top: 86, width: 586, height: 858 },
    maxWidth: 300, // displayed at up to 150px
  },
]

for (const { source, out, crop, surface, maxWidth } of ASSETS) {
  const BG = SURFACE[surface]
  const base = sharp(source).extract(crop).removeAlpha()
  const { data, info } = await base.clone().raw().toBuffer({ resolveWithObject: true })
  const { data: field } = await base.clone().blur(SIGMA).raw().toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  const pixels = Buffer.alloc(width * height * 3)

  for (let i = 0, j = 0; i < data.length; i += channels, j += 3) {
    for (let c = 0; c < 3; c++) {
      const flattened = Math.min(255, Math.max(0, (data[i + c] / (field[i + c] || 1)) * 255))
      pixels[j + c] = Math.round((flattened * BG[c]) / 255)
    }
  }

  let pipeline = sharp(pixels, { raw: { width, height, channels: 3 } })
  if (maxWidth && maxWidth < width) {
    pipeline = pipeline.resize({ width: maxWidth, fit: 'inside', kernel: 'lanczos3' })
  }
  const result = await pipeline.webp({ quality: 90 }).toFile(out)

  console.log(`${out}  ${result.width}x${result.height}  ${Math.round(result.size / 1024)} KB`)
}
