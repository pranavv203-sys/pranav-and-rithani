# Pranav & Rithani — Wedding Invitation

Next.js 16 + React 19 + Tailwind v4, exported as a static site to GitHub Pages.
RSVPs go to a Google Sheet.

**Live:** https://pranavrithani.com

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are needed to run the
site; the RSVP form renders but reports that replies are not open unless
`NEXT_PUBLIC_RSVP_ENDPOINT` is set (see `.env.example`).

There is no test suite. `npm run build` is the check that matters — it runs
TypeScript and produces the static export in `out/`.

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to Pages. Nothing else is required.

Two settings the deploy depends on, both under repo **Settings**:

| Where | Setting | Value |
|---|---|---|
| Pages → Source | | **GitHub Actions** (not "Deploy from a branch") |
| Secrets and variables → Actions → **Variables** | `RSVP_ENDPOINT` | the Apps Script web app URL |

`RSVP_ENDPOINT` is a variable rather than a secret on purpose: it is embedded
in the public JavaScript either way, so marking it secret would hide it from
you and from nobody else. Changing it requires re-running the workflow — a
variable change does not trigger a build on its own.

### Base paths

The site is served from the root of a custom domain, so the base path is empty.
The workflow treats the presence of `public/CNAME` as "custom domain" and sets
it so; without that file it falls back to `/<repo>/`, which is how Pages serves
a project repo. Removing the CNAME file would therefore change every asset URL.

**Any path into `public/` must go through `asset()` in `lib/base-path.ts`.**
`next/image` does not apply `basePath` when `images.unoptimized` is set — its
loader returns `src` untouched. An unprefixed path works perfectly in local dev,
where the prefix is empty, and 404s in production.

## RSVPs

The form posts to a Google Apps Script web app which appends a row to a Sheet.
The script and its full setup steps are in [`scripts/rsvp-sheet.gs`](scripts/rsvp-sheet.gs).

Chosen over a database because it solves reading as well as writing: the Sheet
is shareable, openable on a phone, and exportable for a caterer. A Postgres
table gives none of that without an admin page.

Things worth knowing:

- **Editing the script requires a new deployment.** Deploy → Manage deployments
  → edit → Version → **New version**. Without that the live URL keeps running
  the old code — the usual reason an Apps Script change appears to do nothing.
- **The OAuth scope is pinned** to `spreadsheets.currentonly` in the script's
  `appsscript.json`. Left to infer, Apps Script grants access to *every*
  spreadsheet in the account.
- **The request sends `Content-Type: text/plain`** so it stays a "simple"
  cross-origin request. Apps Script does not answer `OPTIONS`, so
  `application/json` would fail CORS before reaching Google.
- **An unreadable response is treated as success.** Apps Script answers a POST
  with a 302 to a URL that is not reliably readable by the client; the row is
  written regardless. Failing there would tell guests their reply was lost when
  it was saved, and they would send it again.
- **The endpoint is publicly writable.** A honeypot field stops naive bots, not
  a determined person. Delete the deployment after the wedding.

## Artwork

The painted assets in `public/` are generated from the sources in `assets/`:

```bash
node scripts/build-artwork.mjs
```

The sources are scans on cream paper, which needs two corrections. The paper is
darker and greyer than the page, and it is unevenly lit — so a flat colour match
leaves a visible rectangle whichever part you match. The script flat-field
corrects each image (divides it by a heavily blurred copy of itself, evening the
paper to white) and then multiplies the page colour back in.

**Changing `--background` or `--card` in `globals.css` means re-running this
script.** The surface colour is baked into each asset, which is why a divider
built for `--background` shows as a patch on a `bg-card` section — hence the
`tone` prop on `LotusRowDivider`.

Exports are capped at ~2× their display size, because `images.unoptimized` is
required for a static export: whatever is exported is what every device
downloads. If this ever moves to a host with the Next optimizer, drop the
`maxWidth` values and let it generate per-width variants.

## The dormant Postgres path

`app/actions/rsvp.ts`, `lib/db/` and the `db:push` / `db:studio` scripts are the
original database implementation. They are unused — Server Actions need a Node
runtime, which a static export does not have — but left in place deliberately.

To switch back to it: drop `output: 'export'` from `next.config.mjs`, restore
the `submitRsvp` import and call in `components/rsvp-form.tsx`, set
`DATABASE_URL`, and deploy somewhere with Node. Use a **pooled** connection
string (Neon: the `-pooler` host; Supabase: port 6543) — serverless functions
open a connection per cold start and an unpooled string hits the cap.

## Known, deliberately left alone

- The floating confetti canvas sits at `z-index: 5`; only the hero is above it,
  so particles pass over the story, countdown, schedule and RSVP content.
- `falling-petals.tsx`, `PrMonogram`, `KolamDivider`, `SprigDivider`,
  `MinimalDivider`, `MountainDivider`, `GoldFlourish`, `VelPeacock` and
  `ui/button.tsx` are unused.
- No rate limiting or duplicate protection on the RSVP endpoint. A double-tap
  is prevented by disabling the button while submitting, nothing more.

## Share preview

`public/og.png` is the card messaging apps show when the link is pasted. It is
1200×630 (the ratio every platform expects) and PNG rather than WebP, which
several still handle unreliably.

It was rendered from an HTML layout at exactly 1200×630 using the site's own
Cormorant and Jost fonts, then cropped — not generated at build time, because a
static export cannot run Next's image generation.

**Changing the date, venue or names means re-rendering it.** The image is a
flat picture; nothing regenerates it automatically.
