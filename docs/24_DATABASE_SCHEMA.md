# 24 — DATABASE_SCHEMA

## Objetivo

Definir el esquema lógico de persistencia de MotanOS alineado con:

* `docs/diagrams/database.mmd`
* `docs/rules/state-machines.md`
* `docs/rules/business-rules.md`
* `docs/23_DATA_MODEL.md` (dominio)
* DEC-001 (single-tenant v1 — sin `club_id`)

Este documento **no** es SQL ejecutable ni migraciones Drizzle.

Es el contrato de tablas/agregados para implementación.

---

# Principios

* Una fila = un agregado o entidad del ER.
* `status` usa exclusivamente los valores de `state-machines.md`.
* Ownership: `user_id` / `*_user_id` según BR-0016.
* ORM: Drizzle sobre PostgreSQL (ver `22_TECH_STACK.md`).
* RLS obligatorio en tablas de usuario (ver `28_SECURITY.md`).

---

# Tablas (mapeo ER)

## Identity

| Table | PK | Key FKs | Status / notes |
|---|---|---|---|
| `auth_users` | id | — | Supabase Auth identity |
| `users` | id | auth_user_id | USER states: Invited, PendingVerification, Active, Suspended, Deleted |
| `profiles` | id | user_id | 1:1 with users |
| `roles` | id | — | Official role names (DEC-002) |
| `permissions` | id | — | |
| `user_roles` | id | user_id, role_id | |
| `user_preferences` | id | user_id | |

## Membership

| Table | PK | Key FKs | Status |
|---|---|---|---|
| `membership_plans` | id | — | |
| `memberships` | id | user_id, membership_plan_id | Pending, Active, Suspended, Expired, Cancelled |

## Facilities & booking

| Table | PK | Key FKs | Status / notes |
|---|---|---|---|
| `facilities` | id | — | |
| `resources` | id | facility_id | Available, Reserved, Occupied, Blocked, Maintenance, OutOfService |
| `availability_rules` | id | resource_id | |
| `bookings` | id | user_id (owner), resource_id, experience_id?, event_id? | See BOOKING machine; `hold_expires_at` |
| `booking_participants` | id | booking_id, user_id | |
| `waitlist_entries` | id | resource_id, user_id | `offer_expires_at`; non-blocking |
| `check_ins` | id | booking_id, user_id | |

### Booking.status (canonical)

Draft · Pending · Waitlisted · PaymentPending · Confirmed · CheckedIn · InProgress · Completed · Cancelled · NoShow · Expired

**Availability-blocking:** Draft (with hold), Pending, PaymentPending, Confirmed, CheckedIn, InProgress (BR-0031).

## Social

| Table | PK | Key FKs | Notes |
|---|---|---|---|
| `experiences` | id | creator_user_id | |
| `experience_participants` | id | experience_id, user_id | |
| `invitations` | id | experience_id, sender_user_id, recipient_user_id | |
| `groups` | id | creator_user_id | |
| `group_members` | id | group_id, user_id | |
| `friendships` | id | requester_user_id, addressee_user_id | |

## Sport specializations

| Table | PK | Key FKs |
|---|---|---|
| `golf_rounds` | id | booking_id |
| `golf_scorecards` | id | golf_round_id |
| `golf_players` | id | golf_round_id, user_id |
| `padel_matches` | id | booking_id |
| `football_matches` | id | booking_id |
| `football_teams` | id | football_match_id |
| `billiard_matches` | id | booking_id |
| `darts_matches` | id | booking_id |

## Events & tournaments

| Table | PK | Key FKs | Status |
|---|---|---|---|
| `events` | id | experience_id? | EVENT machine |
| `event_registrations` | id | event_id, user_id | |
| `tournaments` | id | — | TOURNAMENT machine |
| `tournament_entries` | id | tournament_id, user_id | |
| `tournament_matches` | id | tournament_id | |
| `tournament_results` | id | tournament_match_id | |

## Restaurant & Digital Menu

| Table | PK | Key FKs | Status / notes |
|---|---|---|---|
| `restaurants` | id | — | |
| `dining_tables` | id | restaurant_id, resource_id | Maps to Resource |
| `menus` | id | restaurant_id | Seasonal Digital Menu |
| `menu_categories` | id | menu_id | |
| `menu_items` | id | menu_category_id | includes availability flag |
| `allergens` | id | — | |
| `menu_item_allergens` | id | menu_item_id, allergen_id | |
| `orders` | id | user_id, booking_id? | ORDER machine |
| `order_items` | id | order_id, menu_item_id | |

## Payments

| Table | PK | Key FKs | Status |
|---|---|---|---|
| `payments` | id | user_id, booking_id?, order_id?, membership_id? | PAYMENT machine |
| `refunds` | id | payment_id | |
| `invoices` | id | payment_id | |

### Payment.status (canonical)

Pending · Authorized · Captured · Failed · Cancelled · Refunded · PartiallyRefunded

## Communication & CMS

| Table | PK | Key FKs | Status |
|---|---|---|---|
| `notifications` | id | user_id | NOTIFICATION machine |
| `notification_preferences` | id | user_id | |
| `recommendations` | id | user_id | |
| `contents` | id | author_user_id | CONTENT machine |
| `media_assets` | id | uploader_user_id, content_id? | |
| `content_versions` | id | content_id | |

## System

| Table | PK | Key FKs | Status |
|---|---|---|---|
| `audit_logs` | id | user_id? | append-only |
| `automation_runs` | id | user_id?, booking_id?, notification_id? | AUTOMATION machine |

---

# Índices lógicos (no SQL)

* `bookings (resource_id, starts_at, ends_at, status)` — solapes availability-blocking.
* `bookings (user_id, status)`.
* `payments (provider_payment_id)` — idempotencia (BR-0114).
* `waitlist_entries (resource_id, created_at)`.

---

# Relación con implementación

1. Generar migraciones Drizzle desde este esquema (nombres de tabla en `snake_case` ↔ entidades `database.mmd`).
2. Aplicar RLS por `users.id` / ownership.
3. Validar transiciones de `status` contra `state-machines.md` en servidor.
4. Mapeo de dominio: Entity Map en `23_DATA_MODEL.md` + DEC-004.
