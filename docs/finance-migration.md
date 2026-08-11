# Migración financiera — preparación para absorción

Este documento prepara la absorción de la lógica financiera hoy vive en
`api-sofware-finances` (Sequelize/Express) dentro de este servicio (NestJS/TypeORM).
**No se migraron datos ni se modificó el repo de finanzas.** Solo se documenta el
mapeo conceptual campo por campo y la diferencia de ownership.

---

## 1. Modelos de presupuestos: diferencia conceptual

El concepto de *budget* existe en ambos sistemas pero está anclado a entidades distintas:

| Aspecto            | api-sofware-finances                    | api-strategy-repository (Nest)             |
|--------------------|-----------------------------------------|--------------------------------------------|
| Anclaje principal  | **Categoría** (por *nombre*, string)    | **Portfolio** (FK real a `portfolios`)     |
| Dueño              | `user_id` FK directa a `users`          | Indirecta: `budget.portfolio.user`         |
| PK                 | `BIGINT` autoincremental                | `UUID`                                     |
| Monto              | `FLOAT` (`total_amount`)                | `DECIMAL(18,8)` (`amount`)                 |
| Moneda             | No existe                               | `currency` (string)                        |
| Períodos           | `weekly` \| `monthly` \| `annual`       | `MONTHLY` \| `QUARTERLY` \| `ANNUAL` \| `CUSTOM` |
| Vigencia           | No existe                               | `startDate` / `endDate` (date)             |
| Borrado            | Soft delete (`deleted_at`, paranoid)    | Hard delete (`repo.remove`)                |
| ORM                | Sequelize                               | TypeORM                                    |

**Conclusión conceptual:** un budget de finanzas ("cuánto gasto por categoría") es un
caso particular del budget de Nest ("cuánto gasto dentro de un portfolio"). Para absorber:

1. El budget de Nest necesita un vínculo a categoría (hoy no tiene columna de categoría);
   el campo `category` de finanzas es un string libre que deberá resolverse a la entidad
   `Category`/`SubCategory` de Nest por nombre y usuario.
2. El `user_id` directo de finanzas pasa a ser ownership indirecta vía portfolio: cada
   budget migrado debe asignarse a un portfolio del usuario (sugerencia: portfolio default).
3. Finanzas no tiene concepto de portfolio; Nest no tiene concepto de budget por categoría.
   El modelo destino debería combinar ambos: `budget → portfolio` (contenedor/owner) y
   `budget → category` (eje de gasto).

---

## 2. Mapeo campo por campo (finanzas → Nest)

Origen: `api-sofware-finances/src/shared/models/budgets.models.ts` (tabla `budgets`).
Destino: `src/modules/portfolio/entities/budget.entity.ts` (tabla `budgets`).

| Campo finanzas   | Tipo finanzas          | Campo Nest    | Tipo Nest            | Nota de migración |
|------------------|------------------------|---------------|----------------------|-------------------|
| `id`             | `BIGINT UNSIGNED` PK   | `id`          | `UUID` PK            | No mapeable 1:1. Generar UUID nuevo y conservar el ID legado en columna de referencia (ej. `legacy_id`) para trazabilidad |
| `total_amount`   | `FLOAT`                | `amount`      | `DECIMAL(18,8)`      | Conversión float → decimal; revisar redondeos |
| `category`       | `STRING(255)`          | *(sin equivalente)* | —              | Resolver nombre → `categories.id`/`sub_categories.id` del mismo usuario; requiere agregar FK de categoría al budget de Nest |
| `period`         | `ENUM(weekly,monthly,annual)` | `period` | `ENUM(MONTHLY,QUARTERLY,ANNUAL,CUSTOM)` | `monthly→MONTHLY`, `annual→ANNUAL`. `weekly` no tiene equivalente directo: decidir entre `CUSTOM` (con `startDate`/`endDate`) o extender el enum |
| `user_id`        | `BIGINT` FK → users    | *(indirecto)* | via `portfolio.user` | Asignar el budget a un portfolio del usuario (default). Requiere mapeo previo `users.id` legado → usuario Nest |
| `created_at`     | `DATE`                 | `createdAt`   | `CreateDateColumn`   | Directo |
| `updated_at`     | `DATE`                 | `updatedAt`   | `UpdateDateColumn`   | Directo |
| `deleted_at`     | `DATE` (soft delete)   | *(sin equivalente)* | —            | Nest borra hard. Decisión pendiente: incorporar soft delete al modelo Nest o excluir filas con `deleted_at` no nulo de la migración |
| *(no existe)*    | —                      | `name`        | `string`             | Derivar de `category` (ej. "Presupuesto <categoría>") al migrar |
| *(no existe)*    | —                      | `currency`    | `string`             | Finanzas no registra moneda; definir default (ej. moneda base del portfolio) |
| *(no existe)*    | —                      | `startDate`   | `date`               | Definir al migrar según `period` (ej. día 1 del período en curso) |
| *(no existe)*    | —                      | `endDate`     | `date` nullable      | Nullable; puede quedar nulo |

### Pendientes antes de migrar datos

- [ ] Agregar relación `category` (FK) a la entidad `Budget` de Nest.
- [ ] Definir política para `period = weekly`.
- [ ] Definir política de soft delete.
- [ ] Tabla/estrategia de mapeo de IDs de usuario entre ambos sistemas.
- [ ] Endpoint de actualización de presupuesto ya existe en Nest: `PUT /api/portfolios/:id/budgets/:bid` (agregado en esta rama).

---

## 3. Ownership: protección por `user_id` en Nest (referencia para finance)

Nest garantiza que un usuario solo pueda leer/modificar sus propios recursos validando
`user_id` en **cada** operación. Esto es lo que finance hoy **no** tiene y debe preservarse
al absorber la lógica.

### Mecanismo general

1. `JwtAuthGuard` (`src/modules/auth/guards/jwt-auth.guard.ts`) aplicado a nivel de
   controlador (`@UseGuards(JwtAuthGuard)`) valida el token y carga `request.user`.
2. `@CurrentUser()` (`src/modules/auth/decorators/current-user.decorator.ts`) extrae el
   usuario del request; el `id` proviene del JWT verificado, nunca del body/query.
3. Cada método de servicio filtra las queries por `user.id` — si el recurso no pertenece
   al usuario, responde `404 Not Found` (no revela existencia).

### Transacciones (`src/modules/transaction/transaction.service.ts`)

- `getTransactionById(userId, id)` busca con `{ id, user: { id: userId } }` → 404 si no es del usuario.
- `updateTransaction` y `deleteTransaction` resuelven la entidad **a través de**
  `getTransactionById`, por lo que heredan el chequeo de ownership antes de modificar/borrar.

### Presupuestos (`src/modules/portfolio/portfolio.service.ts`)

- Ownership en dos niveles:
  1. `getPortfolioById(userId, portfolioId)` valida `{ id, user: { id: userId } }` → el portfolio debe ser del usuario.
  2. El budget se busca con `{ id: budgetId, portfolio: { id: portfolioId } }` → el budget debe pertenecer a ese portfolio.
- `updateBudget` y `deleteBudget` ejecutan ambos chequeos antes de operar.

### Subcategorías (`src/modules/category/category.service.ts`)

- `getSubCategory`/`updateSubCategory`/`deleteSubCategory` cargan `category.user` y
  verifican que la categoría padre sea del usuario (o `isSystem` para lectura).

### Contraste con finance (lo que NO protege)

En `api-sofware-finances`:

- `BudgetRepository.update_budget(id, ...)` y `delete_budget(id)`
  (`src/finance/infrastructure/repository/budgets.repository.ts`) operan **solo por `id`**,
  sin filtrar por `user_id`: cualquier usuario autenticado puede modificar o borrar el
  presupuesto de otro usuario conociendo el ID.
- `TransactionController.update_transaction_id` y `delete_transaction_id`
  (`src/finance/infrastructure/controllers/transaction.controllers.ts`) **no verifican el
  token ni el dueño**: operan directo por `id` de parámetro.
- Solo `create`/`get`/`list` de transacciones validan el token.

**Regla para la absorción:** toda operación de escritura debe conservar el patrón Nest
(resolver la entidad filtrando por usuario antes de modificarla). No portar los paths de
finance que operan por ID sin filtro de owner.
