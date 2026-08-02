/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization is deliberately ON. It was previously switched off with
  // `images: { unoptimized: true }`, which makes next/image emit a bare <img>
  // with no srcset — every device downloaded the full-size file, and the
  // `sizes` props on the artwork did nothing at all. With it enabled, Next
  // generates per-width variants, so phones fetch small files while large
  // screens still get a sharp one.
  //
  // This needs a Node runtime to do the resizing (via sharp), which is fine on
  // any plain `next start` host. If this ever moves to a static export or a
  // host without the optimizer, put `unoptimized: true` back and instead
  // export the assets at ~2x their display size in scripts/build-artwork.mjs.
  images: {
    // The sources are paintings on paper — smooth washes, no flat colour and
    // no hard edges — which is exactly where AVIF beats WebP on size.
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
