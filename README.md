# Strategy Repository API

API Gateway backend-only en Next.js para gestión de estrategias de trading con arquitectura orientada a eventos.

## 🏗️ Arquitectura

Este proyecto implementa una **API Gateway** que se integra en una arquitectura de microservicios para estrategias de trading:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│  Strategy        │───▶│  Event Bus      │
│   (Cliente)     │    │  Repository      │    │  (RabbitMQ)     │
└─────────────────┘    │  API Gateway     │    └─────────────────┘
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  PostgreSQL      │
                       │  Database        │
                       └──────────────────┘
```

## 🚀 Características

- **API Gateway**: Endpoint REST para gestión de estrategias
- **Event-Driven**: Publicación y consumo de eventos con RabbitMQ
- **TypeORM**: ORM para PostgreSQL con TypeScript
- **Validación**: Zod para validación de datos
- **Logging**: Winston con rotación de archivos
- **Docker**: Containerización completa
- **Clean Architecture**: Separación de responsabilidades

## 📋 Prerrequisitos

- Node.js 18+
- Docker y Docker Compose
- PostgreSQL 13+
- RabbitMQ 3+

## 🛠️ Instalación

### Opción 1: Docker Compose (Recomendado)

1. Clona el repositorio:
```bash
git clone <repository-url>
cd strategy-repository
```

2. Copia el archivo de variables de entorno:
```bash
cp env.example .env
```

3. Edita las variables de entorno según tu configuración:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=strategy_repository
DB_USER=postgres
DB_PASSWORD=password

# RabbitMQ Configuration
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_EXCHANGE=trading_events
RABBITMQ_QUEUE_PREFIX=strategy_repository
```

4. Ejecuta con Docker Compose:
```bash
docker-compose up -d
```

### Opción 2: Desarrollo Local

1. Instala dependencias:
```bash
npm install
```

2. Configura la base de datos:
```bash
# Ejecuta las migraciones
npm run db:create
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 📚 API Endpoints

### Estrategias

#### Crear Estrategia
```http
POST /api/strategy
Content-Type: application/json

{
  "name": "RSI Strategy",
  "description": "Estrategia basada en RSI",
  "user_id": "user-uuid-here",
  "rules": [
    {
      "rule_id": "rule-uuid-here",
      "parameters": {
        "period": 14,
        "oversold": 30,
        "overbought": 70
      }
    }
  ]
}
```

#### Obtener Estrategia por ID
```http
GET /api/strategy?id=strategy-uuid-here
```

#### Obtener Estrategias por Usuario
```http
GET /api/strategy?user_id=user-uuid-here&limit=10&offset=0
```

#### Actualizar Estrategia
```http
PUT /api/strategy?id=strategy-uuid-here
Content-Type: application/json

{
  "name": "Updated Strategy Name",
  "description": "Updated description"
}
```

#### Eliminar Estrategia
```http
DELETE /api/strategy?id=strategy-uuid-here
```

#### Obtener Métricas de Estrategia
```http
GET /api/strategy?id=strategy-uuid-here&metrics=true
```

#### Obtener Estado de Estrategia
```http
GET /api/strategy?id=strategy-uuid-here&status=true
```

#### Obtener Logs de Eventos
```http
GET /api/strategy?strategy_id=strategy-uuid-here&logs=true&limit=50
```

#### Validar Estrategia
```http
POST /api/strategy?validate=true
Content-Type: application/json

{
  "name": "Strategy to Validate",
  "user_id": "user-uuid-here",
  "rules": [...]
}
```

## 🔄 Flujo de Eventos

### Eventos Publicados

1. **strategy.requested**: Cuando se crea una nueva estrategia
2. **strategy.updated**: Cuando se actualiza una estrategia
3. **strategy.deleted**: Cuando se elimina una estrategia

### Eventos Consumidos

1. **strategy.validated**: Estrategia validada exitosamente
2. **strategy.invalidated**: Estrategia inválida
3. **backtest.completed**: Backtesting completado
4. **strategy.failed**: Error en el procesamiento
5. **backtest.failed**: Error en el backtesting
6. **evaluation.completed**: Evaluación de IA completada

## 🗄️ Modelo de Datos

### Entidades Principales

- **User**: Usuarios del sistema
- **Strategy**: Estrategias de trading
- **Rule**: Reglas de validación
- **StrategyRule**: Asociación entre estrategias y reglas
- **Validation**: Resultados de validación
- **BacktestResult**: Resultados de backtesting
- **EventLog**: Logs de eventos

### Estados de Estrategia

- `pending`: Pendiente de procesamiento
- `parsed`: Parseada por NLP
- `validated`: Validada exitosamente
- `invalid`: Inválida
- `tested`: Backtesting completado
- `failed`: Error en el procesamiento

## 🐳 Docker

### Construir Imagen
```bash
docker build -t strategy-repository .
```

### Ejecutar Contenedor
```bash
docker run -p 3000:3000 strategy-repository
```

### Docker Compose
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f strategy-repository

# Detener servicios
docker-compose down
```

## 🔧 Configuración

### Variables de Entorno

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=strategy_repository
DB_USER=postgres
DB_PASSWORD=password

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_EXCHANGE=trading_events
RABBITMQ_QUEUE_PREFIX=strategy_repository

# Application
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log
```

## 📊 Monitoreo

### Health Check
```http
GET /api/health
```

### RabbitMQ Management
- URL: http://localhost:15672
- Usuario: guest
- Contraseña: guest

### Logs
Los logs se almacenan en:
- Console: Salida estándar
- Archivo: `logs/app.log`
- Errores: `logs/app.error.log`

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción

# Base de datos
npm run db:create    # Crear tablas
npm run db:migrate   # Ejecutar migraciones
npm run db:generate  # Generar migración

# Linting y formateo
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

## 🏗️ Estructura del Proyecto

```
strategy-repository/
├── config/                 # Configuraciones
│   └── rabbitmq.ts
├── consumers/              # Consumidores de eventos
│   └── EventConsumer.ts
├── controllers/            # Controladores HTTP
│   └── strategy.controller.ts
├── dtos/                   # Data Transfer Objects
│   ├── CreateStrategyDto.ts
│   └── ValidationResultDto.ts
├── entities/               # Entidades TypeORM
│   ├── Strategy.ts
│   ├── User.ts
│   └── ...
├── infrastructure/         # Infraestructura
│   ├── database.ts
│   └── messageBroker.ts
├── mappers/                # Mappers entre entidades y DTOs
│   └── strategy.mapper.ts
├── pages/                  # Páginas Next.js
│   └── api/
│       └── strategy.ts
├── repositories/           # Repositorios de datos
│   └── StrategyRepository.ts
├── services/               # Lógica de negocio
│   └── StrategyService.ts
├── utils/                  # Utilidades
│   ├── uuid.ts
│   └── logger.ts
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── ormconfig.ts
└── package.json
```

## 🔒 Seguridad

- Validación de entrada con Zod
- Headers de seguridad configurados
- Rate limiting configurable
- Logs de auditoría
- Manejo seguro de errores

## 🚀 Despliegue

### Producción

1. Configura variables de entorno de producción
2. Construye la imagen Docker
3. Despliega con Docker Compose o Kubernetes

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: strategy-repository
spec:
  replicas: 3
  selector:
    matchLabels:
      app: strategy-repository
  template:
    metadata:
      labels:
        app: strategy-repository
    spec:
      containers:
      - name: strategy-repository
        image: strategy-repository:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte, email: desarrollo@ovitec.com

## 🔄 Roadmap

- [ ] WebSocket para actualizaciones en tiempo real
- [ ] Autenticación JWT
- [ ] Rate limiting avanzado
- [ ] Métricas con Prometheus
- [ ] Tests unitarios y de integración
- [ ] CI/CD pipeline
- [ ] Documentación OpenAPI/Swagger 