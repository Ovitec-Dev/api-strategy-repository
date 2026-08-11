-- Seeding rules for Strategy Repository
INSERT INTO rules (id, name, description, category, schema) VALUES
('11111111-1111-1111-1111-111111111111', 'Portfolio Diversification', 'Garantiza que ningún activo supere un porcentaje máximo.', 'Validation', '{"max_pct": 20}'),
('22222222-2222-2222-2222-222222222222', 'Risk Management', 'Control de Stop Loss y Take Profit global.', 'Risk', '{"stop_loss": 5, "take_profit": 15}'),
('33333333-3333-3333-3333-333333333333', 'Tech Allocation Limit', 'Límite dinámico para el sector tecnológico.', 'Allocation', '{"max_tech_pct": 35}')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    category = EXCLUDED.category, 
    schema = EXCLUDED.schema;
