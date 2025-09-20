import { z } from 'zod';

export const ValidationResultSchema = z.object({
  strategy_id: z.string().uuid('El strategy_id debe ser un UUID válido'),
  is_valid: z.boolean(),
  validation_messages: z.array(z.string()).optional(),
  risk_assessment: z.record(z.any()).optional(),
  validated_at: z.date().optional()
});

export type ValidationResultDto = z.infer<typeof ValidationResultSchema>;

export const BacktestResultSchema = z.object({
  strategy_id: z.string().uuid(),
  user_id: z.string().uuid(),
  performance_metrics: z.object({
    total_return: z.number(),
    sharpe_ratio: z.number(),
    max_drawdown: z.number(),
    win_rate: z.number(),
    total_trades: z.number(),
    profitable_trades: z.number()
  }),
  trade_log: z.array(z.record(z.any())),
  tested_at: z.date().optional()
});

export type BacktestResultDto = z.infer<typeof BacktestResultSchema>;

export const EventMessageSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.string(),
  timestamp: z.date(),
  data: z.record(z.any()),
  metadata: z.record(z.any()).optional()
});

export type EventMessageDto = z.infer<typeof EventMessageSchema>; 