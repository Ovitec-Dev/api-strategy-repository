# CONTEXT.md — Project Context

## Architecture

[FACT] **NestJS 11 "Strategy Repository API Gateway"** — consolidates strategy management, finance (portfolios/categories/transactions), and auth. Global prefix `/api`, Swagger at `/api/docs`, JWT authentication.

[FACT] **Stack:** TypeORM + PostgreSQL + RabbitMQ (topic exchange `trading_events`, durable) + Passport/JWT.

[FACT] **Modules:** auth, users, portfolio, category, transaction, order, strategy, health, auto-mapper; shared: messaging, database, logging, config.

[FACT] **Ecosystem:**
- `api-trading-strategy` (Python) — publishes/consumes strategy lifecycle events via RabbitMQ
- `api-sofware-finances` (legacy Express/Sequelize) — in process of being absorbed
- `Infrastructura` — Docker compose and deployment config

[FACT] **Event pipeline:** `strategy.requested → (Python) strategy.validated/invalidated → backtest.completed/failed → evaluation.completed/skipped` — full contracts in `docs/events.md`.

## Active Decisions

[DECISION] Event contracts are documented as `.v1` in `docs/events.md` but **routing keys on the wire have no suffix** — renaming would break `api-trading-strategy` (unversioned subscribers). Any suffix migration is coordinated work.

[DECISION] All event consumers check `event_id` against the `processed_events` store before any write (dedup). Safe under at-least-once delivery. Retention policy TBD.

[DECISION] `max_drawdown` in `PerformanceMetricsDto` is a **positive fraction** (e.g. `0.08` not `-0.08`). Correction happens in Nest display/DTO layer, not in Python producer.

[DECISION] Ownership: every write resolves the target entity through a query that includes `user.id` extracted from the verified JWT. Returns 404 if not owned (does not leak existence). This pattern must be preserved when absorbing finance.

[DECISION] Finance absorption: Nest budgets are tied to portfolio; legacy finance budgets are tied to category (by name). Target model is `budget → portfolio` (owner) + `budget → category` (spending axis). Data migration not yet performed; mapping documented in `docs/finance-migration.md`.

[DECISION] `GET /api/health` is unauthenticated (infra healthcheck). Checks DB (`SELECT 1`) and broker connectivity; returns 200 or 503.

## Pending

[TODO] Commit all changes — working tree has accumulated work from `feature/strategy-cleanup` and the event contract implementation, on top of the uncommitted Next.js→NestJS migration.
[TODO] Runtime smoke test — local Postgres and RabbitMQ are down; cannot boot app.
[TODO] FR-NEST-04 QA blocked: Python must confirm `user_id` is now sent at root of `backtest.completed`. Nest consumer is written expecting it; if Python hasn't shipped it yet, this is a pending task on that side.
[TODO] Finance migration pre-reqs: add category FK to `Budget` entity, decide policy for `period=weekly`, adopt soft-delete or exclude `deleted_at` rows, map user IDs between systems.
[TODO] `GET /strategies/:id/executions/:execId/logs` is a placeholder.
[TODO] `strategy.requested` enrichment: `strategy_type`, `symbol`, `timeframe`, `parameters` are now accepted in DTO and stored in `config`, but the frontend/client must actually send them.
[TODO] Retention policy for `processed_events` table (FR-NEST-11 — open, configurable TTL).

## Gotchas

[GOTCHA] **Dirty working tree.** The `dev` branch carries an uncommitted Next.js→NestJS migration (deleted `pages/`, `src/entities/`, `src/infrastructure/`; added `src/modules/`, `src/main.ts`). `git diff` mixes work from different phases.
[GOTCHA] **App won't boot without RabbitMQ.** `EventConsumerService.onModuleInit` throws if it can't subscribe — startup blocks until the broker is reachable.
[GOTCHA] **Finance repo has no ownership protection.** `BudgetRepository` and `TransactionController` perform update/delete by bare ID with no `user_id` filter. Never port that pattern.
[GOTCHA] `rg` (ripgrep) is not available on this machine; use `grep` or the Grep tool instead.
