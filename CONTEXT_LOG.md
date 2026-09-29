# CONTEXT_LOG.md — Change History

## 2026-08-11 — Context system bootstrap
**What was done:** Created `CONTEXT.md` (living state) and `CONTEXT_LOG.md` (append-only history) at project root per team specification.
**Why:** New AIs and developers needed a fast way to understand what exists, how it's wired, and why certain decisions were made — without reading the full codebase or git history.
**Decisions/tradeoffs:** English language. No README pointer added (files at root follow convention, discoverable by any AI). Uncommitted Next.js→Nest migration is referenced as a fact/gotcha rather than reconstructed fully as a separate log entry with uncertain dates.

## 2026-08-08 — feature/strategy-cleanup: legacy removal, health, event contracts, finance prep
**What was done:**
- Removed `src/modules/strategy/controllers/strategy.controller.ts` and `src/modules/strategy/services/strategy.service.ts` — dead code, never registered in any module. Marked `@deprecated` first, built, then deleted. Rebuild passes.
- Added `GET /api/health` (unauthenticated, DB + broker check, 200/503).
- Added `PUT /api/portfolios/:id/budgets/:bid` (update budget with ownership validation).
- Added `GET` and `PUT /api/categories/:id/subcategories/:sid` (individual subcategory with parent-category ownership check).
- Created `docs/events.md` — versioned `.v1` event contracts with exact JSON shapes, producer/consumer mapping, and documented gaps.
- Created `docs/finance-migration.md` — field-by-field mapping of finance→Nest budget models, and ownership comparison.
**Why:** Clean up duplication that accumulated during the Next.js→Nest migration; prepare for finance absorption; document event contracts so both repos can converge.
**Decisions/tradeoffs:**
- Routing keys remain unsuffixed on the wire (e.g. `strategy.requested`, not `strategy.requested.v1`) — renaming would break `api-trading-strategy`'s subscribers. Versioning lives in documentation only.
- No runtime smoke test: Postgres and RabbitMQ were down. Verification = `npm run build` (no tests exist).
- Nothing committed to git; changes sit in a dirty working tree alongside pre-existing migration work.

## ~2025-11 → ~2026-02 — Next.js → NestJS migration (uncommitted)
**What was done:** Replaced Next.js API route (`pages/api/strategy.ts`) and flat express-style layers (`src/controllers/`, `src/services/`, `src/entities/`, `src/infrastructure/`) with modular NestJS structure (`src/modules/*`, `src/shared/*`, `src/main.ts`, `nest-cli.json`). Switched from a custom TypeORM setup to Nest's `TypeOrmModule.forRoot`. Added `auto-mapper`, `health`, and `logging` shared modules.
**Why:** Consolidate strategy management, finance, and auth into a single maintainable NestJS gateway with proper modularization, dependency injection, and Swagger support.
**Decisions/tradeoffs:**
- **Never committed.** Last git commit is from 2025-09-20 (the Next.js era). All migration work lives uncommitted on the `dev` branch.
- Dates are reconstructed from file timestamps: `jest.config.ts` modified 2025-11-09 (first migration-era change), `nest-cli.json`/`src/main.ts`/`package.json` modified 2026-02-22 (Nest structure finalized), `package-lock.json` modified 2026-08-08 (dependency update during feature/strategy-cleanup).
- Legacy flat layout (`src/modules/strategy/controllers/`, `src/modules/strategy/services/`) was created during migration but never wired into modules — dead code that was later removed in feature/strategy-cleanup.
