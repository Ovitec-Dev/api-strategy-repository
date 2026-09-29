# Requirements Specification — Event Contract Implementation

**Source:** `event-contract-proposal.md` (decided, implementation-ready except §1).
**Scope:** changes required in `api-strategy-repository` (Nest) and `api-trading-strategy`
(Python) to implement the agreed event contract on the `trading_events` exchange.
**Status:** all requirements below are ready to implement, **except** those marked
`[BLOCKED BY §1]`, which depend on verifying the current `backtest.completed` producer/consumer
code before implementation starts on that event.

---

## 1. Assumptions & Dependencies

- Routing keys remain unsuffixed on the wire; contract versioning lives in `schema_version`
  field and documentation only — no change to queue names or bindings for existing events.
- Ownership pattern (resolve entity via `user_id` from JWT, 404 if not owned) must be preserved
  for any new Nest write path triggered by a consumed event.
- Delivery is at-least-once; consumers must be idempotent (see NFR-02).

---

## 2. Functional Requirements — Python (`api-trading-strategy`)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-PY-01 | `StrategyRequest` model accepts `strategy_type`, `symbol`, `timeframe`, `parameters` from `strategy.requested` | All four fields parsed and available to `strategy_validator.py`; missing values reported per FR-PY-02, not a crash |
| FR-PY-02 | Publish `strategy.invalidated` when validation fails | Payload includes `strategy_id`, `user_id`, `valid: false`, `reasons: []`, `validated_at`; published in place of, not in addition to, the current silent failure |
| FR-PY-03 | `strategy.validated` includes `strategy_id` at root | Field present and equal to the `strategy_id` received in the triggering `strategy.requested` |
| FR-PY-04 | `[BLOCKED BY §1]` `backtest.completed` payload matches the confirmed target shape | `strategy_id`, `user_id`, `performance_metrics.*`, `trade_log`, `tested_at` all present; exact delta from current code confirmed before this is marked done |
| FR-PY-05 | `max_drawdown` emitted as a positive fraction | e.g. `0.12` for a 12% drawdown; no sign flip anywhere in `backtesting_engine.py` |
| FR-PY-06 | Publish `backtest.failed` on backtest execution error | Payload includes `strategy_id`, `user_id`, `error_message`, `failed_at`; replaces current silent/unhandled failure path |
| FR-PY-07 | `evaluation.completed` includes `strategy_id` at root | Same correctness requirement as FR-PY-03 |
| FR-PY-08 | Publish `evaluation.skipped` when Ollama is unavailable or disabled | Payload includes `strategy_id`, `user_id`, `reason` (`ollama_not_configured` \| `ollama_unreachable` \| `evaluation_disabled`), `skipped_at`; replaces current silent no-op |
| FR-PY-09 | Every published event includes `event_id` (UUID, generator's responsibility) and `schema_version` | Present on all six event types listed above |
| FR-PY-10 | `parameters` validated per `strategy_type` as a generic object (no fixed schema on the wire) | Validator has a per-type required-field check; failures route to FR-PY-02 with specific field names in `reasons` |

---

## 3. Functional Requirements — Nest (`api-strategy-repository`)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-NEST-01 | `strategy.requested` producer includes `strategy_type`, `symbol`, `timeframe`, `parameters` | Verified against whatever entity/DTO currently issues this event; fields sourced from the strategy creation request |
| FR-NEST-02 | Consumer for `strategy.validated` reads `strategy_id` from event root | No longer relies on any other correlation mechanism |
| FR-NEST-03 | New consumer handler for `strategy.invalidated` | Updates strategy status accordingly; respects ownership pattern (`user_id` match) before writing |
| FR-NEST-04 | `[BLOCKED BY §1]` Consumer for `backtest.completed` reads confirmed payload shape | Depends on FR-PY-04 sign-off |
| FR-NEST-05 | New consumer handler for `backtest.failed` | Updates strategy/backtest status accordingly; respects ownership pattern |
| FR-NEST-06 | DTO/handling for `max_drawdown` updated to expect a positive fraction | No sign inversion applied on ingest; any existing display logic assuming negative values is updated to match |
| FR-NEST-07 | New consumer handler for `evaluation.completed` reads `strategy_id` from event root | Same fix pattern as FR-NEST-02 |
| FR-NEST-08 | New consumer handler for `evaluation.skipped` | Treated as a terminal state equivalent to `evaluation.completed` for status-tracking purposes |
| FR-NEST-09 | Queue bindings added for the three new routing keys | `strategy.invalidated`, `backtest.failed`, `evaluation.skipped` bound to `trading_events` exchange, deterministic queue names per existing `{prefix}_{event}` convention |
| FR-NEST-10 | `event_id` dedup check added at the consumer layer, before any write | Consumer resolves `event_id` against a dedup store; if already processed, write is skipped (no-op, not an error) — mirrors the existing resolve-then-guard ownership pattern |
| FR-NEST-11 | Dedup store for processed `event_id`s owned and persisted by Nest | Table/store defined; retention period is a separate open item (see §5) |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | All consumers must be safe under at-least-once delivery (no duplicate side effects on redelivery), enforced via FR-NEST-10/11 |
| NFR-02 | `schema_version` mismatches should be logged, not silently ignored, on both sides, so contract drift is visible before it causes a runtime failure |
| NFR-03 | No existing routing key is renamed or resuffixed as part of this work |
| NFR-04 | Ownership pattern (`user_id` filter, 404-not-leak on mismatch) is preserved on every new/changed write path in Nest |

---

## 5. Out of Scope / Deferred

- `event_id` retention period — not yet decided, tracked separately from this spec.
- `data.ready` as a public event — deferred to a future contract revision if a concrete need
  arises.
- Discriminated-union schema for `parameters` — deferred in favor of the generic-object
  approach (FR-PY-10); revisit only if validation gaps prove costly in practice.
- Integration test for the full `strategy.requested → evaluation.completed`/`evaluation.skipped`
  round trip — required before merge, but tracked as its own task, not a requirement of the
  contract implementation itself.

---

## 6. Traceability

| Requirement group | Contract section |
|---|---|
| FR-PY-01, FR-NEST-01, FR-PY-10 | §1 `strategy.requested` |
| FR-PY-02, FR-PY-03, FR-NEST-02, FR-NEST-03 | §2 `strategy.validated` / `strategy.invalidated` |
| FR-PY-04, FR-PY-05, FR-PY-06, FR-NEST-04, FR-NEST-05, FR-NEST-06 | §4 `backtest.completed` / `backtest.failed` |
| FR-PY-07, FR-PY-08, FR-NEST-07, FR-NEST-08 | §5 `evaluation.completed` / `evaluation.skipped` |
| FR-PY-09, FR-NEST-09, FR-NEST-10, FR-NEST-11, NFR-01, NFR-02 | Conventions / Decision #6, #7 |

---

## 7. Definition of Done

A requirement is done when: the described behavior is implemented, matches the acceptance
criteria above, is covered by at least the unit-test suite already in place on that side
(Python has 12 tests today; Nest has none — new Nest code should not make that gap worse), and
the corresponding row in `docs/events.md` is updated to match. `[BLOCKED BY §1]` items cannot
be marked done until the code verification described in the contract doc is complete.