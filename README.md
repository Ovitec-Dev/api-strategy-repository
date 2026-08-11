# Strategy Repository API Gateway

Este proyecto es la pieza central de una arquitectura orientada a eventos para la gestión de estrategias de trading. Actúa como un **API Gateway** y repositorio persistente, coordinando la validación, programación y ejecución de estrategias a través de microservicios.

## 🏗️ Arquitectura y Tecnologías Core
- **Framework**: [NestJS](https://nestjs.com/) (Enterprise-grade Node.js).
- **Base de Datos**: PostgreSQL con [TypeORM](https://typeorm.io/).
- **Mensajería**: RabbitMQ (amqplib) para comunicación asíncrona desacoplada.
- **Caché/Estado**: Redis para gestión de estados rápidos y rate limiting.
- **Documentación**: Swagger/OpenAPI integrada automáticamente.
- **Infraestructura**: Containerización completa con Docker y Docker Compose.

## 🚀 Características Principales
- **Gestión de Estrategias**: CRUD completo de estrategias, configuraciones y reglas.
- **Scheduler Avanzado**: Motor de programación basado en Cron con control de concurrencia mediante *advisory locks* de PostgreSQL.
- **Event-Driven**: Publicación de eventos de ejecución y consumo de resultados de backtesting y validación.
- **Seguridad Robusta**: Autenticación JWT y soporte para Google OAuth2.
- **Trazabilidad**: Sistema de logging estructurado con Winston y rotación diaria.
- **Idempotencia**: Garantiza que las ejecuciones programadas no se dupliquen accidentalmente.

## 🛠️ Instalación y Despliegue (Docker)

El proyecto está diseñado para desplegarse de manera sencilla usando el stack pre-configurado.

1. **Clonar y configurar**:
   ```bash
   cp .env.example .env
   ```

2. **Construir la imagen de la API**:
   ```bash
   docker build -t strategy-repository-api .
   ```

3. **Levantar el stack completo** (Base de Datos, RabbitMQ, Redis y API):
   ```bash
   docker-compose up -d
   ```

## 📚 Documentación de la API
Una vez que el sistema esté corriendo, puedes acceder a la interfaz interactiva de Swagger para probar todos los endpoints:

🔗 **URL**: `http://localhost:4000/api/docs`

### Módulos Documentados:
- **Auth**: Registro, Login, Refresh Token y Google OAuth.
- **Strategy**: Gestión de estrategias, cronogramas y órdenes.
- **Portfolio**: Seguimiento de activos por usuario.
- **Transaction**: Registro de movimientos financieros.
- **Category**: Organización jerárquica de instrumentos.
- **Order**: Estado y ejecución de órdenes en tiempo real.

## 📂 Estructura del Proyecto
```text
src/
├── modules/          # Módulos de dominio (Auth, Strategy, Portfolio, etc.)
├── shared/           # Infraestructura (Messaging, Database, Logging, Config)
├── dtos/             # Objetos de transferencia de datos globales
├── main.ts           # Punto de entrada de la aplicación
└── ...
```

## 🔄 Flujo de Ejecución Típico
1. El `StrategySchedulerService` detecta una tarea pendiente.
2. Se crea un registro de `StrategyExecution` y una `Order`.
3. Se publica un mensaje en el exchange `trading_events` (RabbitMQ).
4. Un microservicio externo consume el evento, opera y responde con el resultado.
5. El `EventConsumerService` de este repositorio actualiza el estado final.

## 🤝 Soporte
Desarrollado para el ecosistema de **Ovitec DevOps**.
Para soporte técnico, contactar a: `desarrollo@ovitec.com`
