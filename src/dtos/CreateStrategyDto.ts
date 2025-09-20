import { z } from 'zod';

export const CreateStrategySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255, 'El nombre no puede exceder 255 caracteres'),
  description: z.string().optional(),
  user_id: z.string().uuid('El user_id debe ser un UUID válido'),
  rules: z.array(z.object({
    rule_id: z.string().uuid('El rule_id debe ser un UUID válido'),
    parameters: z.record(z.any()).optional()
  })).optional(),
  metadata: z.record(z.any()).optional()
});

export type CreateStrategyDto = z.infer<typeof CreateStrategySchema>;

export const UpdateStrategySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'parsed', 'validated', 'invalid', 'tested', 'failed']).optional(),
  rules: z.array(z.object({
    rule_id: z.string().uuid(),
    parameters: z.record(z.any()).optional()
  })).optional(),
  metadata: z.record(z.any()).optional()
});

export type UpdateStrategyDto = z.infer<typeof UpdateStrategySchema>; 