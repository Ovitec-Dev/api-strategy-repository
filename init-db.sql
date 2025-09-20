-- Inicialización de la base de datos Strategy Repository

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insertar datos de ejemplo para Grades
INSERT INTO grades (id, name, description) VALUES
(1, 'Basic', 'Reglas básicas de validación'),
(2, 'Intermediate', 'Reglas intermedias de validación'),
(3, 'Advanced', 'Reglas avanzadas de validación')
ON CONFLICT (id) DO NOTHING;

-- Insertar datos de ejemplo para Rules
INSERT INTO rules (id, name, description, parameters_schema, grade_id, is_active) VALUES
(
  uuid_generate_v4(),
  'RSI Validation',
  'Validación de parámetros RSI',
  '{"type": "object", "properties": {"period": {"type": "integer", "minimum": 5, "maximum": 50}, "oversold": {"type": "integer", "minimum": 10, "maximum": 40}, "overbought": {"type": "integer", "minimum": 60, "maximum": 90}}}',
  1,
  true
),
(
  uuid_generate_v4(),
  'Moving Average Validation',
  'Validación de parámetros de medias móviles',
  '{"type": "object", "properties": {"short_period": {"type": "integer", "minimum": 5, "maximum": 50}, "long_period": {"type": "integer", "minimum": 10, "maximum": 200}}}',
  1,
  true
),
(
  uuid_generate_v4(),
  'Risk Management Validation',
  'Validación de gestión de riesgo',
  '{"type": "object", "properties": {"stop_loss": {"type": "number", "minimum": 0.1, "maximum": 10.0}, "take_profit": {"type": "number", "minimum": 0.1, "maximum": 20.0}, "position_size": {"type": "number", "minimum": 0.01, "maximum": 1.0}}}',
  2,
  true
)
ON CONFLICT (id) DO NOTHING; 