# Contratos de eventos — api-strategy-repository

Eventos publicados/consumidos por este servicio a través de RabbitMQ.

- **Exchange:** `trading_events` (topic, durable) — configurable vía `RABBITMQ_EXCHANGE`
- **Routing key:** igual al `event_type`
- **Colas de este servicio:** `<queuePrefix>_<event_type>` (ver `rabbit.queuePrefix` en config)
- **Versionado:** cada contrato se versiona con sufijo `.v1`. La routing key actual en el wire
  es el nombre sin sufijo (compatibilidad con `api-trading-strategy`). Renombrar la routing key
  es un cambio coordinado entre ambos servicios y está fuera del scope de esta rama.

## Envelope común

Todo mensaje (en ambos sentidos) usa este envelope:

```json
{
  "event_id": "string",
  "event_type": "string",
  "timestamp": "string (ISO-8601)",
  "data": { },
  "metadata": { }
}
```

| Campo        | Tipo              | Descripción                                                                 |
|--------------|-------------------|-----------------------------------------------------------------------------|
| `event_id`   | string            | Nest: `evt_<epoch_ms>_<rand>`; Python (api-trading-strategy): UUID v4       |
| `event_type` | string            | Nombre del evento (routing key)                                             |
| `timestamp`  | string (ISO-8601) | Momento de publicación                                                      |
| `data`       | object            | Payload específico de cada evento (ver abajo)                               |
| `metadata`   | object            | Nest: `{ "source": "strategy-repository", "version": "1.0.0" }`; Python: `{}` |

Código del envelope: `src/shared/messaging/messaging.service.ts` (Nest) y
`api-trading-strategy/src/core/events/event_bus.py` (`EventMessage`).

---

## strategy.requested.v1

Solicitud de nueva estrategia para parsing/validación.

- **Publica:** Nest — `StrategyRepository.publishStrategyRequested` (`src/modules/strategy/repositories/strategy.repository.ts`) al crear una estrategia
- **Consume:** api-trading-strategy — `nlp_service.py` (routing key `strategy.requested`)

### `data`

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "1f0e6c9a-8b2d-4c5f-9a10-2b3c4d5e6f70",
  "name": "Cruce de medias BTC",
  "description": "Comprar cuando SMA10 cruza sobre SMA30",
  "status": "pending",
  "created_at": "2026-08-08T12:00:00.000Z"
}
```

| Campo         | Tipo   | Requerido | Descripción                                              |
|---------------|--------|-----------|----------------------------------------------------------|
| `strategy_id` | string (uuid) | sí | ID de la estrategia en este servicio              |
| `user_id`     | string (uuid) | sí | Usuario dueño de la estrategia                    |
| `name`        | string | sí        | Nombre de la estrategia                                   |
| `description` | string \| null | no | Descripción                                        |
| `status`      | string | sí        | Estado inicial (`pending`, `validated`, `running`, `completed`, `failed`, `archived`) |
| `created_at`  | string (ISO-8601) | sí | Fecha de creación                                |

---

## strategy.validated.v1

Resultado de validación de una estrategia.

- **Publica:** api-trading-strategy — `strategy_validator.py` (serializa `StrategyValidated.dict()`)
- **Consume:** Nest — `EventConsumerService.handleStrategyValidated` (`src/modules/strategy/event-consumer.service.ts`)

### `data`

```json
{
  "parsed_strategy": {
    "original_request": {
      "name": "Cruce de medias BTC",
      "description": "Comprar cuando SMA10 cruza sobre SMA30",
      "strategy_type": "moving_average",
      "market": "crypto",
      "symbol": "BTCUSDT",
      "timeframe": "1h",
      "parameters": { "short_period": 10, "long_period": 30 },
      "natural_language_description": "comprar btc cuando la media corta cruza la larga",
      "user_id": "1f0e6c9a-8b2d-4c5f-9a10-2b3c4d5e6f70",
      "risk_management": { "stop_loss": 2.0, "take_profit": 4.0 }
    },
    "parsed_parameters": { "short_period": 10, "long_period": 30 },
    "confidence_score": 0.92,
    "validation_errors": [],
    "created_at": "2026-08-08T12:00:01.000Z"
  },
  "is_valid": true,
  "validation_messages": [],
  "risk_assessment": {
    "risk_score": 0.42,
    "risk_level": "MEDIO",
    "risk_factors": ["stop_loss ajustado"],
    "confidence_impact": -0.05
  },
  "validated_at": "2026-08-08T12:00:02.000Z"
}
```

| Campo                 | Tipo     | Requerido | Descripción                                            |
|-----------------------|----------|-----------|--------------------------------------------------------|
| `parsed_strategy`     | object   | sí        | Estrategia parseada por NLP (`StrategyParsed`)         |
| `is_valid`            | boolean  | sí        | Resultado de la validación                             |
| `validation_messages` | string[] | sí (default `[]`) | Mensajes de validación                         |
| `risk_assessment`     | object   | sí (default `{}`) | `risk_score`: float 0..1; `risk_level`: `BAJO`\|`MEDIO`\|`ALTO`; `risk_factors`: string[]; `confidence_impact`: float |
| `validated_at`        | string (ISO-8601) | sí | Fecha de validación                            |

> **Gap conocido:** el consumidor Nest lee `data.strategy_id`, que el modelo `StrategyValidated`
> del productor no incluye en el nivel raíz. Hasta que el productor lo agregue, Nest recibe
> `undefined` en ese campo. El contrato v1 exige `strategy_id` (uuid) en la raíz de `data`.

---

## strategy.invalidated.v1

Estrategia rechazada por validación.

- **Publica:** sin productor activo actualmente (api-trading-strategy publica `strategy.validated.error` ante excepciones; no emite `strategy.invalidated` todavía)
- **Consume:** Nest — `EventConsumerService.handleStrategyInvalidated`

### `data` (contrato esperado)

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "validation_messages": ["At least one rule is required"],
  "risk_assessment": { "risk_score": 0.9, "risk_level": "ALTO" }
}
```

| Campo                 | Tipo     | Requerido | Descripción                          |
|-----------------------|----------|-----------|--------------------------------------|
| `strategy_id`         | string (uuid) | sí | ID de la estrategia rechazada  |
| `validation_messages` | string[] | sí (default `[]`) | Motivos del rechazo          |
| `risk_assessment`     | object   | no (default `{}`) | Evaluación de riesgo         |

---

## backtest.completed.v1

Resultado de backtesting completado.

- **Publica:** api-trading-strategy — `backtesting_engine.py` (serializa `BacktestResult.dict()`)
- **Consume:** Nest — `EventConsumerService.handleBacktestCompleted`; api-trading-strategy — `ai_evaluator.py`

### `data`

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "total_return": 0.15,
  "sharpe_ratio": 1.5,
  "max_drawdown": -0.08,
  "win_rate": 0.65,
  "total_trades": 100,
  "profitable_trades": 65,
  "trades": [
    { "date": "2026-01-05T00:00:00Z", "side": "buy", "price": 42000.5, "quantity": 0.01 }
  ],
  "equity_curve": [
    { "date": "2026-01-05T00:00:00Z", "equity": 10000.0 }
  ],
  "completed_at": "2026-08-08T12:05:00.000Z"
}
```

| Campo               | Tipo     | Requerido | Descripción                          |
|---------------------|----------|-----------|--------------------------------------|
| `strategy_id`       | string   | sí        | ID de la estrategia                  |
| `total_return`      | float    | sí        | Retorno total (ej. `0.15` = 15%)     |
| `sharpe_ratio`      | float    | sí        | Ratio de Sharpe                      |
| `max_drawdown`      | float    | sí        | Máximo drawdown (negativo)           |
| `win_rate`          | float    | sí        | Tasa de ganancia 0..1                |
| `total_trades`      | int      | sí        | Total de operaciones                 |
| `profitable_trades` | int      | sí        | Operaciones rentables                |
| `trades`            | object[] | sí (default `[]`) | Log de operaciones           |
| `equity_curve`      | object[] | sí (default `[]`) | Curva de equity              |
| `completed_at`      | string (ISO-8601) | sí | Fecha de finalización        |

> **Gap conocido:** el consumidor Nest espera `data.user_id`, `data.performance_metrics`
> (objeto anidado) y `data.trade_log`, mientras que el productor actual envía métricas planas
> en la raíz y `trades`. El contrato v1 de Nest (`BacktestResultDto` en `src/dtos/ValidationResultDto.ts`)
> es el objetivo a converger: agregar `user_id` y anidar métricas, o adaptar el consumidor.

---

## backtest.failed.v1

Fallo de backtesting.

- **Publica:** sin productor activo actualmente (api-trading-strategy publica `backtest.completed.error` ante excepciones)
- **Consume:** Nest — `EventConsumerService.handleBacktestFailed`

### `data` (contrato esperado)

```json
{
  "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "error": "No hay datos disponibles para el símbolo solicitado"
}
```

| Campo         | Tipo   | Requerido | Descripción                     |
|---------------|--------|-----------|---------------------------------|
| `strategy_id` | string (uuid) | sí | Estrategia cuyo backtest falló |
| `error`       | string | sí        | Descripción del error           |

---

## evaluation.completed.v1

Resultado de la evaluación por IA de una estrategia ya backtesteada.

- **Publica:** api-trading-strategy — `ai_evaluator.py` (serializa `EvaluationResult.dict()`)
- **Consume:** Nest — `EventConsumerService.handleEvaluationCompleted`; api-trading-strategy — `log_writer.py`

### `data`

```json
{
  "backtest_result": {
    "strategy_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "total_return": 0.15,
    "sharpe_ratio": 1.5,
    "max_drawdown": -0.08,
    "win_rate": 0.65,
    "total_trades": 100,
    "profitable_trades": 65,
    "trades": [],
    "equity_curve": [],
    "completed_at": "2026-08-08T12:05:00.000Z"
  },
  "ai_score": 0.78,
  "ai_recommendation": "Estrategia prometedora, considerar implementación",
  "risk_level": "MEDIO",
  "confidence": 0.85,
  "evaluation_details": { "motivos": ["sharpe > 1.2", "drawdown acotado"] },
  "evaluated_at": "2026-08-08T12:06:00.000Z"
}
```

| Campo                 | Tipo     | Requerido | Descripción                                  |
|-----------------------|----------|-----------|----------------------------------------------|
| `backtest_result`     | object   | sí        | `BacktestResult` completo (ver evento anterior) |
| `ai_score`            | float    | sí        | Puntuación 0..1                              |
| `ai_recommendation`   | string   | sí        | Recomendación de la IA                       |
| `risk_level`          | string   | sí        | `BAJO` \| `MEDIO` \| `ALTO`                  |
| `confidence`          | float    | sí        | Confianza 0..1                               |
| `evaluation_details`  | object   | sí (default `{}`) | Detalles de la evaluación            |
| `evaluated_at`        | string (ISO-8601) | sí | Fecha de evaluación                  |

> **Gap conocido:** el consumidor Nest lee `data.strategy_id` en la raíz; el productor actual
> lo envía anidado en `data.backtest_result.strategy_id`. El contrato v1 exige `strategy_id`
> en la raíz (o adaptar el consumidor a leer el path anidado).

---

## Otros eventos (fuera de este contrato v1)

| Evento                        | Dirección | Observación |
|-------------------------------|-----------|-------------|
| `strategy.execution.started`  | Nest publica | Emitido por `StrategyService.executeManual` y `StrategySchedulerService`; payload: `{ executionId, orderId, config }`. Candidato a `v1` en próxima iteración |
| `strategy.failed`             | Nest consume | Sin productor activo; payload esperado `{ strategy_id, error }` |
| `strategy.created` / `strategy.updated` / `strategy.deleted` / `strategy.status_updated` | Solo `EventLog` interno | No se publican al broker |
| `*.error` (`strategy.validated.error`, `backtest.completed.error`, `evaluation.completed.error`) | Python publica | Emitidos ante excepciones; payload `{ error, original_request }` |
