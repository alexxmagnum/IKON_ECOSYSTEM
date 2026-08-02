# MotanOS — Architectural Decisions

---

## DEC-001 — Tenancy model (resolves AUD-001)

**Status:** Accepted

**Decision:** The current IKON implementation follows Single-Tenant v1 (one club per deployment).

**Consequences:**

* There is no `club_id` isolation requirement in v1.
* `Club Admin` administers the single club of the deployment.
* `Platform Admin` is reserved for platform-level operations (infrastructure, cross-cutting configuration) and does not imply multi-club data access in v1.
* Multi-tenant SaaS (multiple clubs in one database) is **out of scope** until a future decision revises this document.

**Rejected alternative:** Multi-tenant-by-default with mandatory `club_id` on all aggregates.

---

## DEC-002 — Official role names (resolves AUD-014)

**Status:** Accepted

**Decision:** The only official role names are:

| Official name | Notes |
|---|---|
| Guest | Unauthenticated |
| Member | Authenticated registered user |
| Socio | Active membership role |
| Organizer | Creates/manages own experiences/matches |
| Staff | Operational staff |
| Manager | Daily operations manager |
| Club Admin | Club administration |
| Platform Admin | Platform administration |

**Synonyms are forbidden** in new documentation and implementation (e.g. Visitante, Usuario registrado, Organizador, Administrador, Miembro).

---

## DEC-003 — Payment state vocabulary (resolves AUD-008)

**Status:** Accepted

**Decision:** Payment states use exclusively the English vocabulary defined in `docs/rules/state-machines.md` (`PAYMENT` machine). Spanish labels are not canonical.

---

## DEC-004 — Canonical terminology (resolves AUD-011 / AUD-017)

**Status:** Accepted

**Decision:** Official concept names for MotanOS documentation and implementation:

| Official name | Domain |
|---|---|
| Guest | Role |
| Member | Role / identity |
| Socio | Role (membership) |
| Organizer | Role |
| Staff | Role |
| Manager | Role |
| Club Admin | Role |
| Platform Admin | Role |
| User | Domain identity (`USER`) |
| Profile | Profile |
| Membership | Membership |
| Membership Plan | Membership |
| Booking | Booking Engine |
| Resource | Bookable unit |
| Facility | Physical facility |
| Experience | Social / product experience |
| Event | Events module |
| Tournament | Tournaments module |
| Restaurant | Restaurant module |
| Digital Menu | Carta digital |
| Menu | MENU aggregate |
| Menu Item | MENU_ITEM |
| Order | Restaurant order |
| Payment | Payments |
| Notification | Notification Engine |
| Recommendation | Recommendation Engine |
| Content | CMS |
| Golf | Golf |
| Padel | Padel |
| Football 7 | Football 7 |
| Billiard | Billiard |
| Darts | Darts |
| Social Experience Engine | Social engine (SoT: `48`) |
| Notification Engine | SoT: `49` |
| Recommendation Engine | SoT: `50` |
| Search Engine | SoT: `51` |
| CMS | SoT: `52` |
| Booking Engine | SoT: `47` |
| Automation Engine | SoT: `30` |
| Intelligence Engine | SoT: `31` |

**Superseded documents:** `08`, `09`, `11`, `12`, `13`, `14` (see banners therein). Historical names *Community Engine*, *Experience Engine*, *Content Engine* are not SoT.

Spanish narrative may appear in prose, but **canonical identifiers** in rules, states, APIs and schemas use the official names above.

**State / role / module nomenclature (AUD-017):** use exclusively `state-machines.md` state tokens, DEC-002 roles, and the SoT module numbers above. Do not invent parallel Spanish state enums.

---

## DEC-005 — Secrets Governance (ADR-002)

**Status:** Accepted

**Date:** 2026-08-02

**Decision:** MotanOS follows a centralized secrets governance policy. Secrets are owned by Core Security / Infrastructure. There is no independent Secrets Architect.

**Ownership:**

* **Security** — security policy, secret classification, access rules, audit.
* **Backend / Infrastructure** (Supabase/platform as applicable) — secure storage, runtime loading, provider integration.
* **Domain** — never stores or manages its own secrets.

**Classification:** platform secrets (DB credentials, encryption keys, auth secrets, internal service keys) and integration credentials (Stripe, WhatsApp, email, external APIs). Future integration credentials may bind to a concrete implementation without coupling the core.

**Rules:** never store secrets in Git, source code, documentation, or expose them to the frontend. Secrets are separated by environment (Development, Staging, Production).

**Rejected alternative:** a dedicated Secrets Architect or domain-owned secret stores.

**Full record:** `docs/project/ADR-002_SECRETS_GOVERNANCE.md`

---

## DEC-DISCOVERY-001 — Discovery owns recommendation capabilities

**Status:** Accepted

**Date:** 2026-08-02

**Context:** The SoT document `docs/50_RECOMMENDATION_ENGINE.md` names a Recommendation Engine, but MotanOS architecture requires a broader transversal discovery capability (preferences, criteria, and future discovery surfaces).

**Decision:** `@motanos/discovery` is the transversal Shared Engine. Recommendation is an internal capability of Discovery, alongside Preferences, Criteria, and future discovery capabilities.

**Model:**

```text
Discovery Engine
    ├── Recommendation
    ├── Preferences
    ├── Criteria
    └── Future discovery capabilities
```

**Consequences:**

* Package name remains `@motanos/discovery` (no rename).
* Public exports stay on the Discovery package; Recommendation types are capabilities within it.
* Future discovery capabilities may live in this engine without creating additional engines by default.

**Rejected alternative:** Renaming the package to `@motanos/recommendations` or splitting Recommendation into a separate Shared Engine.

---

## DEC-DISCOVERY-002 — Recommendation lifecycle remains provisional

**Status:** Accepted

**Date:** 2026-08-02

**Context:** There is no official `RECOMMENDATION` machine in `docs/rules/state-machines.md`. Consumers and end-to-end recommendation workflows are not fully defined yet.

**Decision:** Foundation statuses live as TypeScript types in `@motanos/discovery`:

* `Pending`
* `Active`
* `Accepted`
* `Rejected`
* `Expired`

They are **provisional**. A later phase may formalize an official state machine when real workflows exist.

**Consequences:**

* Do not invent a SoT state machine for Recommendation in this phase.
* Do not treat these statuses as frozen product law until a future DEC/SoT update.

**Rejected alternative:** Adding a full `RECOMMENDATION` machine to `state-machines.md` before consumer workflows are defined.

---

## DEC-DISCOVERY-003 — Recommendation score semantics

**Status:** Accepted

**Date:** 2026-08-02

**Context:** Discovery does not implement ranking or ML algorithms. An optional `score` field exists for externally produced confidence metadata.

**Decision:**

* Keep `score?: number` on Recommendation.
* `score` represents **normalized confidence**.
* Valid conceptual range: `0 <= score <= 1` (e.g. `0.92`).
* `score` does **not** represent ranking position, list order, or absolute priority.

**Consequences:**

* Producers outside the foundation may attach a confidence value.
* No validators or ranking algorithms are required in the foundation package.

**Rejected alternative:** Interpreting `score` as sort rank or implementing scoring algorithms inside `@motanos/discovery`.

---

## DEC-DISCOVERY-004 — Discovery does not depend on Social

**Status:** Accepted

**Date:** 2026-08-02

**Context:** Social may supply optional signals for discovery, but Discovery must remain independent of concrete social aggregates and of `@motanos/social`.

**Decision:**

* Keep opaque `socialReference?: string` (and equivalent opaque refs).
* Do **not** add a dependency on `@motanos/social`.
* Do **not** import `SocialGroup`, `SocialConnection`, or `SocialParticipation`.

**Consequences:**

* Signals may arrive from Social or other sources via opaque references.
* Domain/engine coupling stays Domain/Social → Discovery (or producers → Discovery), never Discovery → Social.

**Rejected alternative:** Importing `@motanos/social` types into Discovery or treating Social as a hard architectural dependency.

---

## DEC-EXPERIENCE-001 — Experience Layer owns composition

**Status:** Accepted

**Date:** 2026-08-02

**Context:** SoT documents describe Social Experience (`docs/48_SOCIAL_EXPERIENCE_ENGINE.md`) and the EXPERIENCE entity in the data model. Fase 17 introduced `@motanos/experience` as a composition layer. Ownership between Social/domain concepts and the Experience Layer needed clarification.

**Decision:**

* The **Experience Layer** (`@motanos/experience`) owns **composition** of abstract experiences, capabilities, and journeys.
* **Social and Domain modules** own their **business concepts** (social graphs, sport, dining, events, tournaments, memberships, etc.).
* Experience does not redefine or absorb Social Experience Engine product rules; it provides a transversal composition model.

**Consequences:**

* Domains/engines remain sources of business meaning; Experience references capabilities opaquely.
* `docs/48` continues to govern social-experience product philosophy; Experience Layer governs composition contracts.

**Rejected alternative:** Merging Social Experience business concepts into `@motanos/experience` or making Experience a Domain Module that owns golf/restaurant/event semantics.

---

## DEC-EXPERIENCE-002 — Experience remains a Shared Engine / Layer

**Status:** Accepted

**Date:** 2026-08-02

**Context:** Placement under `packages/engines/experience` raised whether Experience should be a Domain Module instead.

**Decision:** `@motanos/experience` remains a **Shared Engine / Experience Layer**, not a Domain Module.

**Consequences:**

* Dependency direction: Domains → Experience (optional), never Experience → Domains.
* Package stays in `packages/engines/experience` with engine-layer independence rules (core + contracts only).

**Rejected alternative:** Moving Experience under `packages/domains/*` or treating it as a sport/dining-specific domain.

---

## DEC-EXPERIENCE-003 — Experience and Journey lifecycles remain provisional

**Status:** Accepted

**Date:** 2026-08-02

**Context:** There are no official `EXPERIENCE` or `JOURNEY` machines in `docs/rules/state-machines.md`. Execution workflows are not defined yet.

**Decision:** Foundation statuses live as TypeScript types in `@motanos/experience`:

**ExperienceStatus:** `Draft`, `Active`, `Archived`

**JourneyStatus:** `Planned`, `InProgress`, `Completed`, `Cancelled`

They are **provisional** until real execution workflows exist. A later phase may formalize SoT state machines.

**Consequences:**

* Do not add EXPERIENCE/JOURNEY machines to `state-machines.md` in this phase.
* Do not treat these statuses as frozen product law until a future DEC/SoT update.

**Rejected alternative:** Inventing official SoT state machines before composition execution is designed.

---

## DEC-EXPERIENCE-004 — Capability vocabulary remains extensible

**Status:** Accepted

**Date:** 2026-08-02

**Context:** Capabilities are referenced by free-form `CapabilityType` strings without importing engines or domains.

**Decision:**

* Capability vocabulary remains **extensible**.
* **No canonical catalog** of capability types is created in this phase.
* Consumers may introduce type strings as needed; a future DEC may introduce a shared catalog in `@motanos/contracts` if required.

**Consequences:**

* No closed enum of capability kinds in `@motanos/experience`.
* No dependency on Booking, Payments, Social, or domains to name capabilities.

**Rejected alternative:** Shipping a closed capability catalog or importing engine/domain packages to type capabilities.

---

## DEC-EXPERIENCE-005 — Discovery and Experience communicate through opaque references

**Status:** Accepted

**Date:** 2026-08-02

**Context:** Discovery may recommend experiences; Experience must not depend on Discovery (or the reverse as a hard package dependency).

**Decision:**

* Discovery and Experience communicate only through **opaque references**.
* **No direct package dependency** either way in this foundation (`@motanos/experience` ↛ `@motanos/discovery`, and Discovery does not import Experience for foundation independence unless a future DEC revises composition wiring at the app layer).

**Consequences:**

* Recommendation `sourceReference` / experience ids may correlate externally.
* Composition and discovery stay independently deployable foundations.

**Rejected alternative:** Adding `@motanos/discovery` as a dependency of Experience (or Experience as a dependency of Discovery) in the foundation packages.

---

## DEC-RUNTIME-001 — Ownership of runtime bootstrap

**Status:** DECISION REQUIRED

**Date:** 2026-08-02

**Context:** `@motanos/runtime` introduces `createMotanOSRuntime()` as the first composition root wiring API, Application, Permissions, and Booking.

**Open question:** Who owns bootstrap long-term — Runtime package only, a dedicated app entry (e.g. `apps/web` / worker), or a Backend delivery package?

**Interim (non-binding):** Composition wiring lives in `@motanos/runtime` via `createMotanOSRuntime()` (product bootstrap) on top of `createRuntime()` (primitive). Production ownership of the entrypoint remains open.

---

## DEC-RUNTIME-002 — Factories vs frameworks for DI

**Status:** DECISION REQUIRED

**Date:** 2026-08-02

**Context:** Runtime uses manual factories + `ServiceRegistry` (in-memory map).

**Open question:** Remain on manual factories, or adopt a DI framework later?

**Interim (non-binding):** Manual factories for the vertical-slice composition root.

---

## DEC-RUNTIME-003 — Service lifecycle / scope

**Status:** DECISION REQUIRED

**Date:** 2026-08-02

**Context:** Current registry is a plain map with no request scope.

**Open question:** Singleton vs request scope (or other) for Authorization, Booking, and UseCases?

**Interim (non-binding):** Process-local instances created once per `createMotanOSRuntime()` call — scope undefined for multi-request servers.

---

## DEC-RUNTIME-004 — In-memory providers vs future adapters

**Status:** DECISION REQUIRED

**Date:** 2026-08-02

**Updated:** 2026-08-02 (hardening)

**Context:** Runtime uses temporary in-memory Authorization and Booking providers inside `createMotanOSRuntime()` for composition tests and local bootstrap. These live under `src/providers/` and are **not** part of the public package API.

**Open question:** When and where do real adapters replace in-memory providers (composition root injection vs separate packages)?

**Interim (non-binding):**

* Defaults: in-memory providers constructed only inside `createMotanOSRuntime()`.
* Overrides: `createMotanOSRuntime({ authorization, booking })`.
* Public surface: bootstrap + contracts only — not provider factories.
* No vendor clients in Runtime.

---

## DEC-BOOKING-QUERY-001 — ListBookings customer scope vs internal filters

**Status:** DECISION REQUIRED

**Date:** 2026-08-02

**Context:** Fase 26 Fix introduces ListBookings with auth-first `booking.list` and reference normalization. Cross-customer list is a tenancy/authorization concern (Security Architect).

**Open question:** May a caller with `booking.list` supply an explicit `customerReference` different from `actorReference` (admin / staff internal filters), or must list always be scoped to the actor unless a separate elevated action exists?

**Interim (non-binding):**

* When `customerReference` is omitted, Application defaults it to `actorReference` (user-scoped list).
* Explicit `customerReference` remains accepted for internal filter support pending this decision.
* Authorization metadata includes normalized filters and `customerScopeDefaulted`.
* No new permission actions in this foundation.

---

## DEC-BOOKING-RESCHEDULE-001 — Reschedule eligible statuses

**Status:** DECISION REQUIRED

**Date:** 2026-08-02

**Context:** Fase 27 adds `BookingService.reschedule` / `RescheduleBooking` as a time-window update. SoT state-machines.md has no dedicated reschedule event; BR-0033 requires availability revalidation on modification. Cancelled must be rejected.

**Open question:** Which non-cancelled statuses may change `startsAt`/`endsAt` without a status transition — especially `Confirmed`, `Waitlisted`, `CheckedIn`, and `InProgress`?

**Interim (non-binding):**

* Allowed: `Draft`, `Pending`, `Waitlisted`, `PaymentPending`, `Confirmed` via `canRescheduleBooking`.
* Rejected: `Cancelled`, final statuses (`Completed`, `NoShow`, `Expired`), `CheckedIn`, `InProgress`.
* Status unchanged on success; overlap check excludes the booking being moved (BR-0031).
* Conflict → Application `ConflictError`.

---

## DEC-BOOKING-HOLD-001 — System vs authorized hold expiration

**Status:** DECISION REQUIRED

**Date:** 2026-08-02

**Context:** Fase 28 adds `BookingService.expireHolds` / `ExpireBookingHolds` as an authorized Application action (`booking.expire`). SoT defines Draft → Expired via `booking.hold_expired` (BR-0037). No cron/scheduler/worker in foundation.

**Open question:** Will hold expiration remain an authorized Application invocation (ops/admin/system actor), or become an automatic system-initiated job outside the request path?

**Interim (non-binding):**

* Expiration is an explicit use case requiring `actorReference` + `booking.expire`.
* Callers supply `now` (no wall-clock scheduler in Runtime).
* Target status: `Expired` (SoT), not `Cancelled`.
* PaymentPending TTL path (BR-0037) remains out of this foundation slice.

---

## DEC-BOOKING-EVENTS-001 — ApplicationResult vs Domain Events emission

**Status:** SUPERSEDED by DEC-BOOKING-EVENTS-002

**Date:** 2026-08-02

**Context:** Fase 29 introduced Booking domain event contracts without emission.

---

## DEC-BOOKING-EVENTS-002 — Event ownership and ApplicationResult transport

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 30 wires real emission after Booking mutations.

**Decision:**

* **Ownership (Option A):** `@motanos/booking` adapters emit events after successful mutations via `emitBooking*` helpers; `BookingResult.events` / `ExpireBookingHoldsResult.events` carry them.
* **Transport (Option C):** `ApplicationSuccess.events` optionally forwards engine events to upper layers without changing `data`.
* **API:** remains unaware — `toApiResponse` maps only `data` / `error` / `metadata` (events are not copied into the HTTP envelope).
* **Runtime:** no EventBus / dispatcher / consumers.

**Rejected:** Application inventing event payloads independently of the engine (Option B alone).

---

## DEC-BOOKING-PERSISTENCE-001 — Booking persistence boundary (Repository)

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 31 introduces a persistence boundary without choosing a database vendor.

**Decision:**

* **Contract ownership:** `BookingRepository` lives in `@motanos/booking` (`packages/engines/booking/src/repositories/`). Methods: `create`, `getById`, `list`, `update`, `findConflicts`.
* **Domain service:** `createBookingService(repository)` owns lifecycle, availability, and event emission; it depends only on the repository abstraction.
* **Adapter ownership:** Concrete adapters (starting with `InMemoryBookingRepository`) are composed by **Runtime**. Future PostgreSQL / Supabase / ORM adapters will also be Runtime (or infra) concerns — not Application or API.
* **Composition:** Runtime wires `BookingRepository` → `BookingService` → Application use cases. Application and API must not import or call `BookingRepository`.
* **Deferred:** PostgreSQL, Supabase, ORM choice, migrations, connection pools, and real transactions.

**Rejected:** BookingService owning Maps/arrays; Application depending on repositories; API exposing storage.

---

## DEC-BOOKING-TRANSACTION-001 — Booking mutation consistency boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 32 defines consistency between aggregate change, persistence, and domain events — without real DB transactions.

**Decision:**

* **Coordinator / ownership:** `BookingService` (`createBookingService`) owns the **Booking Mutation Boundary**. Application remains on Option A (no `BookingTransactionService`).
* **Ordered phases:** (1) domain validation → (2) aggregate state change → (3) repository persist (`create` / `update`) → (4) domain event production.
* **Completion:** A mutation is complete when persistence has succeeded and the service returns a result. Events in that result are valid only if produced **after** a successful persist of the described aggregate.
* **Invariant:** No successful domain event if repository persist failed; no persist if validation/transition failed.
* **Helper:** `commitBookingMutation(persist, produceEvents)` encodes persist-before-emit. Not a Unit of Work, Outbox, EventBus, or DB transaction.
* **Repository:** remains persistence-only (no events, no use cases, no lifecycle control) — aligns with DEC-BOOKING-PERSISTENCE-001.
* **Events:** continue per DEC-BOOKING-EVENTS-002 (engine emission; ApplicationSuccess.events transport).
* **Deferred:** real DB transactions, Unit of Work, Outbox Pattern, Event Store, message queues.

**Rejected:** Emitting events before persist; Application coordinating persistence+events; Repository emitting events.

---

## DEC-BOOKING-QUERY-002 — Booking command / query boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 33 separates read responsibilities from command mutations without full CQRS. Note: `DEC-BOOKING-QUERY-001` already covers ListBookings customer scope.

**Decision:**

* **Query ownership:** `BookingQueryService` lives in `@motanos/booking` (`packages/engines/booking/src/queries/`). Methods: `getBooking`, `listBookings`, `checkAvailability`.
* **Command ownership:** `BookingService` retains create / confirm / cancel / reschedule / update / expireHolds only (mutations + events).
* **Repository:** keep a **single** `BookingRepository` shared by command and query services for now. No `BookingQueryRepository` until a distinct read store is justified.
* **Application:** Query use cases (Get / List / CheckAvailability) depend on `BookingQueryService`. Command use cases that need a pre-load use `bookingQuery.getBooking` then `BookingService` for the mutation. Application does not call Repository.
* **Runtime:** wires the same repository into both services.
* **Deferred:** full CQRS, read DB, projections, event sourcing, caches, replicas.

**Rejected:** Queries mutating state or emitting events; Application → Repository; separate query repository without a concrete read-model need.

---

## DEC-BOOKING-AUTH-001 — Booking Authorization Policy boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 34 clarifies Booking access decisions vs domain lifecycle rules without full RBAC.

**Decision:**

* **Ownership:** `BookingAuthorizationPolicy` lives in `@motanos/booking` (`packages/engines/booking/src/policies/`).
* **Relation to AuthorizationService:** Policy maps Booking operations → action strings and consults a `BookingAuthorizationGateway` adapted from platform `AuthorizationService` (Runtime/Application wiring). Booking engine does **not** depend on `@motanos/permissions`.
* **Policy vs Domain:** Policy answers “may this actor perform this Booking operation on this resource?” Domain services answer “is this state transition / availability rule valid?” (e.g. Cancelled → Confirmed is FailedPrecondition, not Forbidden).
* **Application:** Use cases call `bookingAuthorizationPolicy.decide` then Booking command/query services. No Application → Repository.
* **Deferred:** full RBAC, memberships, dynamic roles, tenant permissions, ABAC, IdP.

**Rejected:** Mixing lifecycle eligibility into authorization; Booking → Runtime; API exposing policies.

---

## DEC-BOOKING-TENANT-001 — Booking Tenant Context boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 35 prepares MotanOS Booking for multi-tenant isolation without implementing SaaS tenancy infrastructure. Note: DEC-001 (IKON Single-Tenant v1 deployment) remains for club deployment model; this DEC scopes the **Booking engine contract** for portable tenant context.

**Decision:**

* **Ownership:** `BookingTenantContext` (`tenantReference` only) lives in `@motanos/booking` (`packages/engines/booking/src/context/`).
* **Entity (Option A):** `Booking` includes `tenantReference` on the aggregate so persisted facts and events carry scope.
* **Propagation:** Tenant is an **explicit** argument on Repository methods and Application/API inputs — never from Runtime globals, JWT, or hostname in this foundation.
* **Repository:** `create|getById|list|update|findConflicts(tenant, …)` isolate by tenant; wrong-tenant reads return null / empty.
* **Authorization:** `BookingAuthorizationPolicy` requires `tenantReference` and rejects booking context whose tenant mismatches the request.
* **Events:** Booking domain events include `tenantReference` for future consumers (no EventBus).
* **Deferred:** RLS, organizations, memberships, billing, plans, tenant roles, resolvers.

**Rejected:** Hidden tenant resolution; Option B-only (context without entity field) for this foundation; Application → Database.

---

## DEC-BOOKING-AUDIT-001 — Booking Audit Context boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 36 defines a transversal Audit Context for Booking after Persistence, Transaction, Query, Authorization Policy, and Tenant boundaries exist. Audit answers “who did what, on what resource, when, in which tenant?” — not “may they?” (Authorization) and not “is the change valid?” (Domain).

**Decision:**

* **Ownership:** `BookingAuditRecord` and audit action tokens live in `@motanos/booking` (`packages/engines/booking/src/audit/`). The Booking engine owns the contract because it knows Booking actions, resources, and lifecycle. Not owned by API, Runtime, or Database.
* **Record shape:** Opaque fields only — `auditReference`, `tenantReference`, `actorReference`, `action`, `resourceType`, `resourceReference`, `occurredAt`, optional controlled `metadata`. No PII dumps, secrets, tokens, credentials, or full request/response payloads.
* **Actions (foundation):** `booking.created`, `booking.confirmed`, `booking.cancelled`, `booking.rescheduled`, `booking.expired`, `booking.read`. Audit label `booking.expired` correlates with domain event type `booking.hold_expired` without renaming domain events.
* **Relation to Domain Events:** Domain Events remain facts of domain occurrence (DEC-BOOKING-EVENTS-002). Audit Records are separate traceability facts. Neither replaces the other; action tokens may align by name where useful.
* **Application / Runtime:** Application must not call Audit Storage. Future emission is via this contract only. Runtime remains composition root — no logging providers, cloud sinks, or external stores in this phase.
* **Persistence:** Do not mix `BookingRepository` with a future `AuditRepository`. No real audit persistence in this foundation.
* **Deferred:** compliance, retention, SIEM, GDPR completeness, Elasticsearch, event streaming, distributed logs, observability/metrics/tracing infrastructure.

**Rejected:** Application → Audit Storage; Audit as substitute for Domain Events; embedding secrets/PII in audit records; Booking → Runtime for sinks.

---
