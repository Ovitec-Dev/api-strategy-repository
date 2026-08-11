-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: grades
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: rules
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parameters_schema JSONB,
  grade_id INTEGER REFERENCES grades(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: strategies
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: strategy_rules
CREATE TABLE IF NOT EXISTS strategy_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  parameters JSONB,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: validations
CREATE TABLE IF NOT EXISTS validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_rule_id UUID NOT NULL REFERENCES strategy_rules(id) ON DELETE CASCADE,
  passed BOOLEAN NOT NULL,
  message TEXT,
  validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: backtest_results
CREATE TABLE IF NOT EXISTS backtest_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  total_trades INTEGER,
  winning_trades INTEGER,
  losing_trades INTEGER,
  profit_factor DECIMAL(10, 2),
  sharpe_ratio DECIMAL(10, 2),
  max_drawdown DECIMAL(10, 2),
  total_return DECIMAL(10, 2),
  tested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: event_logs
CREATE TABLE IF NOT EXISTS event_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  '{"type": "object", "properties": {"period": {"type": "integer", "minimum": 5, "maximum": 50}, "oversold": {"type": "integer", "minimum": 10, "maximum": 40}, "overbought": {"type": "integer", "minimum": 60, "maximum": 90}}}'::jsonb,
  1,
  true
),
(
  uuid_generate_v4(),
  'Moving Average Validation',
  'Validación de parámetros de medias móviles',
  '{"type": "object", "properties": {"short_period": {"type": "integer", "minimum": 5, "maximum": 50}, "long_period": {"type": "integer", "minimum": 10, "maximum": 200}}}'::jsonb,
  1,
  true
),
(
  uuid_generate_v4(),
  'Risk Management Validation',
  'Validación de gestión de riesgo',
  '{"type": "object", "properties": {"stop_loss": {"type": "number", "minimum": 0.1, "maximum": 10.0}, "take_profit": {"type": "number", "minimum": 0.1, "maximum": 20.0}, "position_size": {"type": "number", "minimum": 0.01, "maximum": 1.0}}}'::jsonb,
  2,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Insertar usuario de prueba
INSERT INTO users (id, name, email) VALUES
('00000000-0000-0000-0000-000000000001', 'Test User', 'test@example.com')
ON CONFLICT (id) DO NOTHING;
