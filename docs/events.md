# Event Contracts — api-strategy-repository

Events published/consumed by this service through RabbitMQ exchange `trading_events`.

**Exchange:** `trading_events` (topic, durable) — configurable via `RABBITMQ_EXCHANGE`
**Routing key:** equals `event_type` (no version suffix — see Decision below)
**Queues:** `{queuePrefix}_{event_type}` (see `rabbit.queuePrefix` in config)
**Dedup:** all consumers check `event_id` against `processed_events` store before any write
**Envelope:** see §0

## Versioning decision

Contracts are documented with `.v1` suffix for clarity, but **routing keys on the wire
have no suffix** (e.g. `strategy.requested`, not `strategy.requested.v1`). Renaming routing
keys is a breaking change requiring coordinated updates to `api-trading-strategy`.

The `metadata.schema_version` field is `1` for all events below. Mismatches are logged
but not rejected (NFR-NEST-02).

---

## §0 Envelope (common)

```json
{
  "event_id": "string",
  "event_type": "string",
  "timestamp": "string (ISO-8601)",
  "data": { ... },
  "metadata": { "source": "string", "schema_version": "string" }
}
```

| Field        | Type              | Notes                                                        |
|--------------|-------------------|--------------------------------------------------------------|
| `event_id`   | string            | Nest: `evt_<epoch>_<rand>`; Python: UUID v4                  |
| `event_type` | string            | Routing key (unsuffixed)                                     |
| `timestamp`  | string            | ISO-8601                                                     |
| `data`       | object            | Event-specific payload                                       |
| `metadata`   | object            | `source`: producer id; `schema_version`: `"1"` for all events below |

---

## strategy.requested.v1

Request for a new strategy to be parsed/validated by Python.

- **Publisher:** Nest — `StrategyRepository.publishStrategyRequested`
- **Consumer:** api-trading-strategy → `nlp_service`

### `data`

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "1f0e6c9a-8b2d-4c5f-9a10-2b3c4d5e6f70",
  "name": "Cruce de medias BTC",
  "description": "Comprar cuando SMA10 cruza sobre SMA30",
  "status": "PENDING",
  "created_at": "2026-08-08T12:00:00.000Z",
  "strategy_type": "moving_average",
  "symbol": "BTCUSDT",
  "timeframe": "1h",
  "parameters": { "short_period": 10, "long_period": 30 }
}
```

| Field           | Type             | Required | Source                                              |
|-----------------|------------------|----------|-----------------------------------------------------|
| `strategy_id`   | string (uuid)    | yes      | Nest strategy PK                                    |
| `user_id`       | string (uuid)    | yes      | From JWT / creation DTO                             |
| `name`          | string           | yes      | Creation DTO                                        |
| `description`   | string \| null   | no       | Creation DTO                                        |
| `status`        | string           | yes      | `PENDING`                                           |
| `created_at`    | string (ISO)     | yes      | Nest timestamp                                      |
| `strategy_type` | string \| null   | no       | DTO → `config.strategy_type` (e.g. `moving_average`, `rsi`) |
| `symbol`        | string \| null   | no       | DTO → `config.symbol` (e.g. `BTCUSDT`)              |
| `timeframe`     | string \| null   | no       | DTO → `config.timeframe` (e.g. `1h`, `1d`)          |
| `parameters`    | object           | yes `{}` | DTO → `config.parameters` (rule params for Python)  |

---

## strategy.validated.v1

Strategy passed validation in Python.

- **Publisher:** api-trading-strategy → `strategy_validator`
- **Consumer:** Nest → `EventConsumerService.handleStrategyValidated`

### `data`

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "is_valid": true,
  "validation_messages": [],
  "risk_assessment": { "risk_score": 0.42, "risk_level": "MEDIO" },
  "validated_at": "2026-08-08T12:00:02.000Z"
}
```

| Field                 | Type      | Required | Notes                                              |
|-----------------------|-----------|----------|----------------------------------------------------|
| `strategy_id`         | string    | yes      | At root level (FR-NEST-02)                         |
| `is_valid`            | boolean   | yes      | Always `true` for this event                       |
| `validation_messages` | string[]  | yes `[]`|                                                    |
| `risk_assessment`     | object    | yes `{}` | `risk_score`: float 0..1; `risk_level`: enum       |
| `validated_at`        | string    | no       | Optional ISO timestamp                             |

---

## strategy.invalidated.v1

Strategy failed validation in Python.

- **Publisher:** api-trading-strategy (future — currently emits `strategy.validated.error` on exceptions)
- **Consumer:** Nest → `EventConsumerService.handleStrategyInvalidated`

### `data`

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "validation_messages": ["At least one rule is required"],
  "risk_assessment": { "risk_score": 0.9, "risk_level": "ALTO" }
}
```

| Field                 | Type      | Required | Notes                     |
|-----------------------|-----------|----------|---------------------------|
| `strategy_id`         | string    | yes      |                           |
| `validation_messages` | string[]  | yes `[]` | Reasons for rejection     |
| `risk_assessment`     | object    | yes `{}` |                           |

---

## backtest.completed.v1

Backtesting completed in Python.

- **Publisher:** api-trading-strategy → `backtesting_engine`
- **Consumer:** Nest → `EventConsumerService.handleBacktestCompleted`; api-trading-strategy → `ai_evaluator`

### `data`

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "1f0e6c9a-8b2d-4c5f-9a10-2b3c4d5e6f70",
  "performance_metrics": {
    "total_return": 0.15,
    "sharpe_ratio": 1.5,
    "max_drawdown": 0.08,
    "win_rate": 0.65,
    "total_trades": 100,
    "profitable_trades": 65
  },
  "trade_log": [
    { "date": "2026-01-05T00:00:00Z", "side": "buy", "price": 42000.5, "quantity": 0.01 }
  ]
}
```

| Field                | Type     | Required | Notes                                            |
|----------------------|----------|----------|--------------------------------------------------|
| `strategy_id`        | string   | yes      |                                                  |
| `user_id`            | string   | yes      | At root (FR-NEST-04)                             |
| `performance_metrics`| object   | yes `{}`| Nested — not flat at root                        |
| `performance_metrics.max_drawdown` | number | yes | **Positive fraction** (FR-NEST-06, e.g. `0.08` not `-0.08`) |
| `trade_log`          | object[] | yes `[]` |                                                  |

---

## backtest.failed.v1

Backtesting failed in Python.

- **Publisher:** api-trading-strategy (future — currently emits `backtest.completed.error` on exceptions)
- **Consumer:** Nest → `EventConsumerService.handleBacktestFailed`

### `data`

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "error": "Data source unavailable"
}
```

| Field         | Type   | Required | Notes          |
|---------------|--------|----------|----------------|
| `strategy_id` | string | yes      |                |
| `error`       | string | yes      | Error message  |

---

## evaluation.completed.v1

AI evaluation completed in Python.

- **Publisher:** api-trading-strategy → `ai_evaluator`
- **Consumer:** Nest → `EventConsumerService.handleEvaluationCompleted`; api-trading-strategy → `log_writer`

### `data`

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "ai_score": 0.78,
  "ai_recommendation": "Deploy",
  "risk_level": "MEDIO",
  "confidence": 0.85,
  "evaluation_details": {}
}
```

| Field               | Type   | Required | Notes                          |
|---------------------|--------|----------|--------------------------------|
| `strategy_id`       | string | yes      | At root (FR-NEST-07)           |
| `ai_score`          | float  | yes      | 0..1                           |
| `ai_recommendation` | string | yes      |                                |
| `risk_level`        | string | yes      | `BAJO` \| `MEDIO` \| `ALTO`   |
| `confidence`        | float  | yes      | 0..1                           |
| `evaluation_details`| object | yes `{}`|                                |

---

## evaluation.skipped.v1

AI evaluation was skipped (terminal state, equivalent to completed for tracking).

- **Publisher:** api-trading-strategy (new)
- **Consumer:** Nest → `EventConsumerService.handleEvaluationSkipped`

### `data`

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "reason": "Insufficient backtest data"
}
```

| Field         | Type   | Required | Notes                            |
|---------------|--------|----------|----------------------------------|
| `strategy_id` | string | yes      |                                  |
| `reason`      | string | no       | Defaults to "Evaluation skipped by pipeline" |

---

## Other events (outside this v1 contract)

| Event                        | Direction          | Notes                                                     |
|------------------------------|--------------------|-----------------------------------------------------------|
| `strategy.execution.started` | Nest publishes     | Payload: `{ executionId, orderId, config }`. Candidate for v1 next iteration |
| `strategy.failed`            | Nest consumes      | Payload: `{ strategy_id, error }`. No active producer yet |
| `strategy.created/updated/deleted` | Internal only  | Logged to `event_logs`, not published to broker            |
| `*.error` variants           | Python publishes   | Emitted on exceptions: `{ error, original_request }`      |

---

## Dedup store (FR-NEST-10/11)

Table `processed_events` (column: `event_id` unique, `event_type`, `processed_at`).
Every consumer checks `isEventProcessed(event_id)` before any write, then calls
`markEventProcessed(event_id, event_type)`. Retention policy TBD (FR-NEST-11).
