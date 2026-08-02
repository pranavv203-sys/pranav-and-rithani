/**
 * GitHub Pages serves a project repo from https://<owner>.github.io/<repo>/,
 * so everything the page requests needs that prefix. The deploy workflow sets
 * NEXT_PUBLIC_BASE_PATH from the repo name, and leaves it empty for a
 * <owner>.github.io repo or a custom domain. Empty locally, so `npm run dev`
 * is unaffected.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

/**
 * Prefix a path in public/ with the deployment base path.
 *
 * Required because next/image does NOT apply basePath when
 * `images.unoptimized` is set: the default loader normally routes through
 * /_next/image (which is prefixed), but in unoptimized mode it returns `src`
 * untouched. Without this the artwork 404s on a project page while working
 * perfectly in local dev, where basePath is empty — an easy way to ship a
 * broken site that looked fine on your machine.
 */
export function asset(path: string) {
  return `${basePath}${path}`
}
