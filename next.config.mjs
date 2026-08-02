/**
 * Configured for a static export to GitHub Pages.
 *
 * Two things are switched off relative to a server deployment, both forced by
 * Pages serving plain files with no Node runtime behind them:
 *
 *  - `output: 'export'` — no server, so no Server Actions. The RSVP form is
 *    stubbed out in app/page.tsx for now; app/actions/rsvp.ts and lib/db are
 *    left in place, ready to reconnect when the site moves to a host that can
 *    run them.
 *  - `images.unoptimized` — there is no optimizer to resize on the fly, so
 *    next/image emits a plain <img> and `sizes` has no effect. To compensate,
 *    scripts/build-artwork.mjs exports each asset at roughly 2x its display
 *    size rather than at source resolution.
 *
 * To go back to a server deployment: delete `output`, delete
 * `images.unoptimized`, restore <RsvpForm /> in app/page.tsx, and drop the
 * maxWidth values from the artwork script.
 */

// GitHub Pages serves a project repo under /<repo>/, so assets need that
// prefix. The deploy workflow sets this from the repo name and leaves it empty
// for a <user>.github.io repo or a custom domain. Empty locally, so `npm run
// dev` is unaffected.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  // Directory-style URLs, which is what a plain file server expects.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
