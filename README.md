# Pranav & Rithani — Wedding Invitation

Next.js 16 + React 19 + Tailwind v4 + Drizzle/Postgres.

## Setup

```bash
pnpm install          # or npm install
cp .env.example .env  # then fill in DATABASE_URL
pnpm db:push          # creates the `rsvps` table
pnpm dev
```

Open http://localhost:3000

## Deploy

Push to GitHub, import in Vercel, set `DATABASE_URL` in project settings.
Use your provider's **pooled** connection string (Neon: the `-pooler` host;
Supabase: port 6543). Serverless functions open a new connection per cold
start, and an unpooled string will hit the connection cap under load.

## Reading RSVPs

There is currently no admin view — responses land in the `rsvps` table only.
`pnpm db:studio` opens Drizzle Studio locally against your database.

## Changes from the v0 export

- Added `drizzle-kit` + `drizzle.config.ts` (the export had no way to create the table)
- Pool is cached on `globalThis` so dev hot-reload doesn't leak connections
- Removed `typescript.ignoreBuildErrors` — real type errors now surface
- `Reveal` ref typing fixed (was relying on the ignored build errors)
- RSVP success icon `text-accent-foreground` → `text-accent` (was invisible on `bg-secondary`)
- RSVP attending buttons stack on mobile instead of squeezing two across
- Dropped unused imports in `page.tsx`; removed `@types/canvas-confetti`, eslint script, hono override
- Sketch converted to WebP (926 KB → 99 KB) and `priority` removed — it's a below-fold background
- Added `sizes` and a mobile object-position so the left-hand spires stay in frame
- Added a placeholder `icon.svg`

## Known, deliberately left alone

- The floating confetti canvas sits at `z-index: 5`; only the hero is above it,
  so particles pass over the story, countdown, schedule and RSVP content.
- `falling-petals.tsx`, `KolamDivider`, `SprigDivider`, `MinimalDivider`,
  `MountainDivider`, `GoldFlourish`, `VelPeacock` and `ui/button.tsx` are unused.
- No rate limiting or duplicate protection on the RSVP endpoint.
