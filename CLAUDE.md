# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **yarn** (`.npmrc` sets `package-lock=false`).

```bash
yarn dev      # next dev --turbo
yarn build    # next build (ESLint is skipped during builds via next.config.js)
yarn lint     # eslint . --ext .ts,.tsx --fix
```

There is no test suite.

## What this app is

Citrica's company site plus an internal back-office, in a single Next.js 15 App Router project:

- **Public/marketing pages**: `app/page.tsx`, `app/home/`, `app/landing-restaurantes/`, `app/web-page-express/`, `app/projects/[slug]/`, `app/schedule/` (booking), `app/versions/` (per-designer variants).
- **`app/[campaign]/app/`**: QR campaign landing — reads `utm_source`, beacons to `/api/track-qr-visit`, then redirects using a hardcoded `REDIRECT_URLS` map.
- **`app/admin/`**: role-gated CRM/back-office — `crm/` (contactos, empresas, leads, proyectos, reuniones), `agenda/`, `sales-analytics/`, `ia/` (RAG chat UI), `users/`, roles, CMS, client portal (`client/mis-datos/`).

## Auth

Supabase via `@supabase/auth-helpers-nextjs`. **There is no `middleware.ts`** — admin protection is client-side in `app/admin/layout.tsx`: it reads `UserAuth()` and redirects to `/login` when there is no session, then gates routes by `role_id` against `siteConfig.sidebarItems[].allowedRoles` (`config/site.ts`). Role 1 = admin, role 12 = cliente (lands on `/admin/client/mis-datos`).

Provider mount order in `app/layout.tsx`: `QueryProvider` → `SupabaseProvider` (`shared/context/supabase-context.tsx`, exposes `useSupabase()`) → `AuthContextProvider` (`shared/context/auth-context.tsx`, exposes `UserAuth()` with `userSession`/`userInfo`, checks `active_users`, RPC `get_user_with_role`) → `AvailabilityProvider` → `Providers` (HeroUI + toast + next-themes).

API routes authenticate with `createRouteHandlerClient({ cookies })`; admin/user-management and cron routes use a service-role client.

## Data layer — two patterns

1. **Most features**: client hooks in `hooks/<feature>/` call Supabase directly — `"use client"` + `useSupabase()` + `useState`/`useCallback` + HeroUI `addToast` on error. Example: `hooks/companies/use-companies.tsx` (`useCompanyCRUD`). Follow this pattern for new CRM features.
2. **Sales-analytics only**: react-query hooks (`hooks/sales-analytics/`) that `fetch` the `app/api/sales-analytics/*` routes.

Database schema is documented in `DATABASE_SCHEMA.md` (CRM tables) and `SISTEMA_RAG.md` (RAG tables). Migrations live in `supabase/migrations/` (`NNN_description.sql`).

## AI subsystems (Gemini)

- **RAG** (`app/api/rag/*`, core logic `lib/ai/gemini-service.ts`): document upload to Supabase Storage + Gemini File API; chat streams with `@ai-sdk/google` `streamText`. Docs: `SISTEMA_RAG.md`, `docs/GEMINI_RESPONSE_PROFILES.md`.
- **Sales analytics** (`app/api/sales-analytics/*`, helpers `lib/sales-analytics/`): AI reports over per-project external sales DBs; credentials encrypted with `SALES_ENCRYPTION_KEY` (`encryptionHelpers.ts`). Docs under `docs/SALES_ANALYTICS_*.md`.
- **Model config** (`app/api/ai/*`): Gemini model/API config stored in Supabase.
- **Cron**: `vercel.json` schedules `/api/cron/send-reminders` daily at 13:00 UTC (Resend emails, `CRON_SECRET`, timezone `America/Lima`).

## UI — three component sources (don't confuse them)

1. **`citrica-ui-toolkit`** (npm package): design-system primitives — `Text`, `Button`, `Container`, `Col`, `Icon`, `Input`, `Select`. Preferred for layout/typography in pages. (The `citrica-ui-toolkit-0.0.9.tgz` at repo root is an older local build; the dependency resolves from the registry.)
2. **`@heroui/*`**: interactive components (modals, tables, dropdowns, toasts, calendar). Themed in `tailwind.config.js`.
3. **`shared/components/citrica-ui/`** (local, aliased `@citrica-ui` / `@ui/*`): the repo's own atoms/molecules/organisms (navbar, sidebar, admin components). This is *not* the npm toolkit despite the similar name.

## Styles

`styles/globals.scss` loads Tailwind then ITCSS layers `01-settings` … `11-atomic-design`, then `custom.scss`. Numbered layers are marked "NO EDITAR" — put custom global styles in `styles/custom.scss` and per-page styles in `styles/webpages-styles/`. The Citrica grid lives in `styles/07-objects/` (aliased `@citrica/*`).

## Path aliases

`@/*` → repo root · `@citrica-ui` / `@ui/*` → `shared/components/citrica-ui` · `@types/*` → `shared/types` · `@citrica/*` → `styles/07-objects`

## Env vars

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, `SALES_ENCRYPTION_KEY`. Note: two service-role var names are in use (`NEXT_PUBLIC_SUPABASE_SERVICE_ROLE` in auth-context, `SUPABASE_SERVICE_ROLE_KEY` in API routes). No `.env.example` exists — only `.env.local`.
