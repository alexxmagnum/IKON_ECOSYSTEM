# 25 — API CONTRACTS

## Objetivo

Definir el contrato de comunicación entre frontend, backend y servicios internos de **IKON_ECOSYSTEM**.

Alineado con:

* `docs/24_DATABASE_SCHEMA.md`
* `docs/diagrams/database.mmd`
* `docs/rules/state-machines.md`
* `docs/rules/business-rules.md`
* `docs/project/DECISIONS.md` (DEC-001 … DEC-004)

Este documento **no** inventa dominios nuevos. Usa exclusivamente los agregados ya modelados.

---

# Filosofía

La API es un contrato.

Una vez publicada, cualquier cambio incompatible debe evitarse o gestionarse mediante versionado.

El frontend nunca debe depender de implementaciones internas.

Solo de contratos estables.

La API no existe para reflejar la base de datos fila a fila.

Existe para ofrecer una interfaz estable, segura y coherente al resto del sistema.

---

# Principios

## Consistencia

Todas las respuestas siguen una estructura común.

## Predictibilidad

Una misma operación devolverá siempre el mismo formato.

## Tipado

Todos los datos estarán tipados mediante TypeScript y validados con Zod.

## Seguridad

Nunca se expondrán datos innecesarios.

Cada respuesta contendrá únicamente la información que el rol tiene permiso de consultar (`27_PERMISSIONS.md`, `permission-matrix.md`).

## Versionado

Prefijo de ruta: `/api/v1/...`

Cuando un cambio sea incompatible, se publicará `/api/v2/...` sin romper clientes existentes.

## Idempotencia

Mutaciones de pago y confirmación de Booking aceptan cabecera `Idempotency-Key` (BR-0114).

## Single-tenant

No hay `club_id` en recursos v1 (DEC-001).

---

# Envelope de respuesta

## Éxito

```json
{
  "data": {},
  "meta": {
    "request_id": "uuid",
    "version": "v1"
  }
}
```

Colecciones:

```json
{
  "data": [],
  "meta": {
    "request_id": "uuid",
    "version": "v1",
    "page": 1,
    "page_size": 20,
    "total": 0
  }
}
```

## Error

```json
{
  "error": {
    "code": "BOOKING_OVERLAP",
    "message": "human readable",
    "details": {}
  },
  "meta": {
    "request_id": "uuid",
    "version": "v1"
  }
}
```

Nunca se expondrá stack trace ni SQL.

---

# Recursos canónicos (DEC-004)

| Recurso API | Agregado / tablas | Módulo SoT |
|---|---|---|
| `User` | `users` | Identity |
| `Profile` | `profiles` | `45` |
| `Membership` / `Membership Plan` | `memberships`, `membership_plans` | `44` |
| `Booking` | `bookings`, `booking_participants`, `waitlist_entries` | `47` |
| `Resource` / `Facility` | `resources`, `facilities` | Booking |
| `Experience` | `experiences`, `experience_participants` | `48` |
| `Event` | `events`, `event_registrations` | `42` |
| `Tournament` | `tournaments`, `tournament_entries`, … | `43` |
| `Restaurant` | `restaurants`, `dining_tables` | `35` |
| `Digital Menu` | `menus`, `menu_categories`, `menu_items`, `allergens` | `36` |
| `Order` | `orders`, `order_items` | `35` / `36` |
| `Payment` | `payments`, `refunds`, `invoices` | `46` |
| `Notification` | `notifications` | `49` |
| `Recommendation` | `recommendations` | `50` |
| `Content` | `contents`, `media_assets` | `52` |

Sinónimos ambiguos prohibidos en rutas y payloads (`Reserva` → `Booking`, `Carta` → `Digital Menu` / `Menu`, `Producto` → `Menu Item`, `Socio` como rol de membresía se mantiene cuando es el rol oficial).

---

# Vocabularios de estado

Los campos `status` usan **exactamente** los valores de `state-machines.md`:

| Recurso | Máquina |
|---|---|
| Booking | BOOKING |
| Payment | PAYMENT |
| Membership | MEMBERSHIP |
| Event | EVENT |
| Tournament | TOURNAMENT |
| Order | ORDER |
| Notification | NOTIFICATION |
| Content | CONTENT |
| User | USER |
| Resource | RESOURCE (apéndice) |

---

# Operaciones genéricas

Por recurso, cuando el negocio lo permita:

* `GET` colección (paginar, filtrar, ordenar)
* `GET` por id
* `POST` crear
* `PATCH` actualizar parcial
* `POST …/cancel` o transición de estado explícita (preferida frente a DELETE físico)

No todos los recursos permiten todas las operaciones.

---

# Contratos prioritarios

## Auth / User

* Sesión vía Supabase Auth; el backend resuelve `User` + roles oficiales (DEC-002).
* Guest: acceso de solo lectura a Digital Menu y contenido público.
* Member y superiores: mutaciones según matriz de permisos.

## Booking

* `POST /api/v1/bookings` — crea `Draft` con hold (TTL por defecto 15 min, BR-0035).
* Transiciones solo vía eventos canónicos BOOKING (no estados inventados).
* Solapes: rechazar si existe otra Booking en conjunto **availability-blocking** (BR-0031).
* Waitlist: `Waitlisted` no bloquea Resource; oferta con TTL (BR-0037).
* Ownership: `user_id` del propietario (BR-0016).

Campos mínimos de creación:

* `resource_id`
* `starts_at` / `ends_at`
* `experience_id?` / `event_id?`

## Payment

* Estados: Pending · Authorized · Captured · Failed · Cancelled · Refunded · PartiallyRefunded (DEC-003).
* El frontend **no** habla con Stripe; solo con la API de aplicación.
* Confirmación de Booking que requiera pago: `PaymentPending` hasta `Captured` según BR de Payments / Restaurant.

## Digital Menu

* `GET /api/v1/menus/active` — menú de temporada activo (BR-0163); Guest permitido (BR-0082).
* `GET /api/v1/menu-items/{id}` — incluye alérgenos (BR-0089).
* Favoritos: solo Member (BR-0161).
* Precio expuesto = precio aplicable en consulta (BR-0162).

## Order

* Solo si el club habilita pedidos (BR-0083).
* No se puede añadir `Menu Item` con disponibilidad no pedible (`available = false` / agotado).
* Estados ORDER: Draft · Sent · … según `state-machines.md`.
* Puede asociarse a `booking_id` cuando exista reserva de mesa.

---

# Paginación, filtros y ordenación

* Paginación obligatoria en colecciones (`page`, `page_size`).
* Filtros frecuentes: fecha, `status`, categoría, disponibilidad, tipo de Experience / Resource.
* Ordenación explícita; nunca depender del orden de almacenamiento.

---

# Integraciones

Stripe, Resend, n8n y proveedores externos **nunca** se consumen desde el frontend.

Toda integración pasa por la capa de aplicación / Automation Engine (`30`).

---

# Observabilidad

Operaciones relevantes emiten `request_id` y pueden generar `audit_logs` para roles autorizados (BR-0157).

---

# Regla final

Cualquier campo o estado no presente en `database.mmd`, `state-machines.md` o DEC-004 **no** forma parte del contrato v1.
