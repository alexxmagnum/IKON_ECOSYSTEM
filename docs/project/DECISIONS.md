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

## DEC-BOOKING-INTEGRATION-001 — Booking Integration Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 37 introduces an outbound Integration Boundary so Booking can express needs toward future external providers without coupling the domain to SDKs, vendor APIs, credentials, or external formats.

**Decision:**

* **Ownership:** Integration ports live in `@motanos/booking` (`packages/engines/booking/src/integrations/`). Booking defines *what* is needed. Provider adapters belong to Runtime / future infrastructure — not to API, Application use cases, or domain services.
* **Ports (foundation):** Aggregate `BookingIntegrationPort` with capability ports:
  * `BookingNotificationPort.sendBookingNotification` — channel-agnostic (future email / WhatsApp / push).
  * `BookingPaymentPort.requestPayment` — provider-agnostic (future payment vendors).
  * `BookingCalendarPort.syncBookingCalendar` — calendar-agnostic (future external calendars).
* **Contract shape:** Opaque references and internal kinds only. No API keys, tokens, passwords, provider configs, or vendor payloads on port requests.
* **Relation to Domain Events:** Domain Events remain domain occurrence facts (DEC-BOOKING-EVENTS-002). Integrations are separate outbound effects. Do not call providers from `BookingService`; future consumers may react to events via adapters wired at composition time.
* **Application:** Use cases must not call providers (`Application → Provider` forbidden). Flow remains Use Case → Booking Service → Result; outbound integration enters only through these ports when wired later.
* **Runtime:** Composition root for future `Integration Port → Provider Adapter` wiring. No secrets, SDKs, or real providers in this foundation.
* **Deferred:** concrete providers, webhooks, queues, external contract mapping, secret management, calendar OAuth.

**Rejected:** Booking → vendor SDKs; Application → Provider; embedding credentials in integration contracts; treating Domain Events as the integration layer itself.

---

## DEC-BOOKING-WORKFLOW-001 — Booking Workflow Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 38 introduces a Workflow Boundary for multi-step Booking business processes after Persistence, Transaction, Query, Authorization, Tenant, Audit, and Integration boundaries exist. Workflows answer “which steps form a process?” — not “is this change valid?” (Domain) and not “how is it scheduled?” (Infrastructure).

**Decision:**

* **Ownership:** `BookingWorkflow`, `BookingWorkflowDefinition`, and related factories live in `@motanos/booking` (`packages/engines/booking/src/workflows/`). Booking owns process contracts because it knows lifecycle coordination. Future runners, schedulers, workers, and queues belong to Runtime / infrastructure — not to API or Application use cases.
* **Contract shape:** Opaque fields — `workflowReference`, `kind`, `bookingReference`, `tenantReference`, `actorReference`, `currentStep`, `state`, optional controlled `metadata`. No secrets, tokens, or provider payloads.
* **Kinds (foundation definitions only):** `booking.confirmation`, `booking.payment`, `booking.reminder`. Definitions list ordered step ids; no execution.
* **Relation to Domain:** Workflows coordinate; Domain Rules / `BookingService` decide validity. Flow remains Workflow → BookingService → Domain Rules. Workflows must not decide whether a booking state transition is valid.
* **Relation to Domain Events:** Domain Events remain occurrence facts (DEC-BOOKING-EVENTS-002), e.g. `booking.confirmed`. Future workflow coordination signals (e.g. `confirmation.workflow.completed`) are separate and are not emitted in this foundation.
* **Application:** Use cases must not depend on a workflow engine (`Application → Workflow Engine` forbidden). Flow remains Use Case → Booking Service → Result. Workflow is a future coordination boundary.
* **Runtime:** Composition root for a future `Workflow Definition → Runner`. No cron, queues, workers, or BPM engines in this foundation.
* **Deferred:** scheduling, retries, sagas, Temporal / BullMQ / RabbitMQ, distributed workflow state.

**Rejected:** Workflow as substitute for Domain Rules; Application → Workflow Engine; embedding credentials; implementing real async infrastructure in this phase.

---

## DEC-BOOKING-NOTIFICATION-001 — Booking Notification Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 39 introduces a Notification Boundary so Booking can express communication intents without coupling Domain Services to email, WhatsApp, push, SMS, or other delivery channels.

**Decision:**

* **Ownership:** `BookingNotificationRequest`, notification kinds, and factories live in `@motanos/booking` (`packages/engines/booking/src/notifications/`). Booking owns the contract because it knows which lifecycle facts may need communication. Provider adapters belong to Runtime / future infrastructure.
* **Relation to Integration Boundary:** `BookingNotificationPort` (DEC-BOOKING-INTEGRATION-001) accepts `BookingNotificationRequest` from this boundary. Integration owns the outbound port; Notification owns the request shape and kinds.
* **Contract shape:** Opaque fields — `notificationReference`, `tenantReference`, `bookingReference`, `recipientReference`, optional `actorReference`, `notificationKind`, optional controlled `metadata`. No emails, phone numbers, message bodies, templates, tokens, or credentials.
* **Kinds (foundation):** `booking.confirmed`, `booking.cancelled`, `booking.reminder`, `booking.payment_required`. Kinds are internal intents, not channels.
* **Relation to Domain Events:** Domain Events are occurrence facts (DEC-BOOKING-EVENTS-002). Notification Requests are separate communication asks. Not every event implies a notification; not every notification requires a new domain event. No dispatcher in this foundation.
* **Relation to Workflow Boundary:** Workflows may eventually coordinate a step that produces a Notification Request (e.g. reminder / confirmation notify). Workflows do not send messages themselves (DEC-BOOKING-WORKFLOW-001).
* **Application:** Forbidden `Application → Email Service` (or any provider). Flow remains Use Case → Booking Service → Result. Future path: Event / Workflow → Notification Boundary → (Runtime) Provider Adapter.
* **Runtime:** Composition root for future `Notification Port → Provider Adapter`. No SMTP, SDKs, secrets, or delivery infrastructure in this foundation.
* **Deferred:** providers, templates, delivery, retries, queues, workers.

**Rejected:** BookingService → sendEmail; Application → provider; embedding PII/contact channels in the request contract; treating Domain Events as the notification layer.

---

## DEC-BOOKING-PAYMENT-001 — Booking Payment Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 40 introduces a Payment Boundary so Booking can express payment intents without coupling Domain Services to payment gateways, card processing, or financial ledgers.

**Decision:**

* **Ownership:** `BookingPaymentRequest`, payment kinds, and factories live in `@motanos/booking` (`packages/engines/booking/src/payments/`). Booking owns the contract because it knows when a booking needs payment. Provider adapters belong to Runtime / future infrastructure. Aligns with `22_PAYMENT_ARCHITECT` separation of payment intent vs gateway execution.
* **Relation to Integration Boundary:** `BookingPaymentPort` (DEC-BOOKING-INTEGRATION-001) accepts `BookingPaymentRequest` from this boundary and returns `BookingPaymentResult`. Integration owns the outbound port; Payment owns the request shape and kinds.
* **Contract shape:** Opaque fields — `paymentReference`, `tenantReference`, `bookingReference`, `payerReference`, optional `actorReference`, `paymentKind`, `amountReference`, optional controlled `metadata`. No card numbers, payment tokens, credentials, or vendor payloads. `amountReference` is opaque context — not a full financial model.
* **Kinds (foundation):** `booking.deposit`, `booking.full_payment`, `booking.payment_required`, `booking.refund`. Kinds are internal intents, not gateway charge types. No invoices, taxes, or accounting in this foundation.
* **Relation to Domain Events:** Domain Events are occurrence facts (DEC-BOOKING-EVENTS-002). Payment Requests are separate intents. No payment events, webhooks, or payment dispatcher in this foundation.
* **Relation to Workflow Boundary:** Workflows may coordinate a step that produces a Payment Request (DEC-BOOKING-WORKFLOW-001). Workflows must not call payment vendors.
* **Relation to Notification Boundary:** Payment and Notification are distinct capabilities (DEC-BOOKING-NOTIFICATION-001). A payment-required intent may later trigger a Notification Request; neither replaces the other.
* **Application:** Forbidden `Application → Payment Provider`. Flow remains Use Case → Booking Service → Result. Future path: Workflow / Event → Payment Boundary → (Runtime) Provider Adapter.
* **Runtime:** Composition root for future `Payment Port → Provider Adapter`. No vendor SDKs, secrets, or webhooks in this foundation.
* **Deferred:** concrete providers, real charges, invoicing, reconciliation, accounting, subscriptions, wallets.

**Rejected:** BookingService → vendor SDK; Application → provider; embedding card/secret data in the request contract; treating Domain Events as the payment layer.

---

## DEC-BOOKING-AVAILABILITY-001 — Booking Availability Policy Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 41 introduces an Availability Policy Boundary so Booking can evaluate capacity/availability intents without coupling Domain Services or Application to external calendars, slot engines, or sync providers.

**Decision:**

* **Ownership:** `BookingAvailabilityRequest`, kinds, policy/port contracts, and factories live in `@motanos/booking` (`packages/engines/booking/src/availability/`). Booking owns the contract because it knows resources, bookings, and overlap concerns. Provider adapters belong to Runtime / future infrastructure.
* **Relation to Domain helpers:** Pure overlap helpers in `domain/availability` remain domain math. This boundary is the policy/intent contract for availability evaluation — not a replacement for those helpers.
* **Relation to Query Boundary:** `BookingQueryService` reads existing booking state (DEC-BOOKING-QUERY-002). Availability Policy evaluates capacity under a policy. Neither replaces the other.
* **Contract shape:** Opaque fields — `availabilityReference`, `tenantReference`, `resourceReference`, optional `bookingReference`, optional `actorReference`, `availabilityKind`, `startAt` / `endAt` range context, optional controlled `metadata`. No calendar tokens, private calendar payloads, or emails.
* **Kinds (foundation):** `booking.resource_check`, `booking.slot_check`, `booking.capacity_check`. Internal only — not Google/Outlook event types.
* **Policy / Port:** `BookingAvailabilityPolicy.evaluate` answers policy availability. `BookingAvailabilityPort.checkAvailability` is the future outbound port for capacity providers. Distinct from Integration `BookingCalendarPort` sync (DEC-BOOKING-INTEGRATION-001) — sync ≠ availability check.
* **Relation to Domain Events:** Domain Events are occurrence facts (DEC-BOOKING-EVENTS-002). Availability Requests are separate evaluations. No availability events or dispatchers in this foundation.
* **Relation to Workflow:** Workflows may coordinate Availability Boundary then Booking operations (DEC-BOOKING-WORKFLOW-001). Workflows must not call external calendar SDKs.
* **Separation from Payment / Notification:** Availability is capacity; Payment is economic intent; Notification is communication — do not mix (DEC-BOOKING-PAYMENT-001, DEC-BOOKING-NOTIFICATION-001).
* **Application:** Forbidden `Application → Availability Provider`. Flow remains Use Case → Booking Service / Query → (optional) Availability Boundary.
* **Runtime:** Composition root for future `Availability Port → Provider Adapter`. No calendar SDKs, secrets, or sync jobs in this foundation.
* **Deferred:** external calendars, advanced slot engines, scheduling, real capacity providers, persisted slot stores.

**Rejected:** BookingService → Calendar API; Application → Availability Provider; embedding calendar credentials; substituting Availability Policy for BookingQueryService or Domain Rules.

---

## DEC-BOOKING-RESOURCE-001 — Booking Resource Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 42 introduces a Resource Boundary so Booking can identify reservable resources without coupling Domain Services or Application to inventory systems, ERP, facility tables, or domain-specific asset modules.

**Decision:**

* **Ownership:** `BookingResource`, resource kinds, port contract, and factories live in `@motanos/booking` (`packages/engines/booking/src/resources/`). Booking owns the contract because bookings reserve resources. Provider adapters belong to Runtime / future infrastructure.
* **Relation to Domain `Resource`:** `domain/resource` (`Resource`, `RESOURCE_TYPES`) remains the in-engine aggregate vocabulary. `BookingResource` is the boundary identity contract (tenant-scoped opaque reference + kind) — not a CRUD inventory model and not a replacement for domain `Resource`.
* **Contract shape:** Opaque fields — `resourceReference`, `tenantReference`, `resourceKind`, optional `resourceName`, optional controlled `metadata`. No credentials, user dumps, or ERP payloads.
* **Kinds (foundation):** `booking.table`, `booking.court`, `booking.room`, `booking.seat`, `booking.equipment`. Internal concepts only — not full restaurant/golf/hotel modules.
* **Relation to Availability:** Resource answers “what is the resource?” Availability answers “is it free in this window?” (DEC-BOOKING-AVAILABILITY-001). Do not merge.
* **Relation to Query:** `BookingQueryService` reads bookings (DEC-BOOKING-QUERY-002). Resource Boundary describes resource identity. Neither replaces the other.
* **Relation to Integration:** Resource is identity; Integration is outbound communication (DEC-BOOKING-INTEGRATION-001). No resource providers in Integration in this foundation. Future `BookingResourcePort → Adapter` at Runtime.
* **Relation to Domain Events:** No `resource.created|updated|deleted` events in this foundation. Booking domain events remain separate (DEC-BOOKING-EVENTS-002).
* **Relation to Workflow:** Workflows may consult Resource Boundary then Booking operations (DEC-BOOKING-WORKFLOW-001). Workflows must not call inventory SDKs.
* **Separation from Payment / Notification / Availability:** Resource = identity; Payment = money; Notification = communication; Availability = temporal capacity.
* **Application:** Forbidden `Application → Resource Provider`. Flow remains Use Case → Booking Engine Boundary.
* **Runtime:** Composition root for future Resource Port adapters. No external bases, ERP, or inventory APIs in this foundation.
* **Deferred:** inventory administration, panels, sync, real tables/courts/rooms, categories, CRUD catalogs.

**Rejected:** BookingService → table store; Application → Resource Provider; embedding secrets; fusing Resource with Availability; implementing resource domain events in this phase.

---

## DEC-BOOKING-MEMBERSHIP-001 — Booking Membership Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 43 introduces a Membership Boundary so Booking can represent actor↔community relationships that may affect reservations, without coupling Domain Services or Application to CRM, user profiles, commercial plans, or subscription billing.

**Decision:**

* **Ownership:** `BookingMembership`, kinds, statuses, port contract, and factories live in `@motanos/booking` (`packages/engines/booking/src/memberships/`). Booking owns the contract because membership may condition booking eligibility. Provider adapters belong to Runtime / future infrastructure.
* **Contract shape:** Opaque fields — `membershipReference`, `tenantReference`, `memberReference`, `membershipKind`, `status`, optional controlled `metadata`. No emails, phones, documents, credentials, or CRM profiles.
* **Kinds (foundation):** `booking.member`, `booking.guest`, `booking.vip`, `booking.staff`, `booking.partner`. Internal relationship kinds — not commercial plans, prices, or benefits.
* **Statuses (foundation):** `active`, `inactive`, `suspended`, `pending`. Relationship status only — not billing/renewal.
* **Relation to Authorization:** Authorization answers “may this actor perform this Booking operation?” (DEC-BOOKING-AUTH-001). Membership answers “what relationship does the actor have with the community?” Member ≠ Permission — do not merge.
* **Relation to Tenant:** Every membership is scoped by `tenantReference` (DEC-BOOKING-TENANT-001). `tenantReference` → `membershipReference` isolation is mandatory.
* **Relation to Resource / Availability:** Membership = who belongs; Resource = what is reserved; Availability = whether it is free (DEC-BOOKING-RESOURCE-001, DEC-BOOKING-AVAILABILITY-001).
* **Relation to Domain Events:** No `member.created|updated|removed` events in this foundation. Booking domain events remain separate (DEC-BOOKING-EVENTS-002).
* **Relation to Workflow:** Workflows may consult Membership Boundary then Booking operations (e.g. members-only premium resources) (DEC-BOOKING-WORKFLOW-001). Workflows must not call CRM APIs.
* **Relation to Integration / Payment / Notification:** Membership is belonging; Integration is outbound I/O; Payment is money; Notification is communication — do not mix.
* **Application:** Forbidden `Application → Membership Provider`. Flow remains Use Case → Booking Engine Boundary.
* **Runtime:** Composition root for future `Membership Port → Adapter`. No CRM SDKs, user stores, or external member APIs in this foundation.
* **Deferred:** CRM, real users/socios, commercial plans, dues, renewals, recurring billing, subscriptions.

**Rejected:** BookingService → customer store; Application → CRM API; embedding PII; fusing Membership with Authorization; implementing membership domain events in this phase.

---

## DEC-BOOKING-POLICY-001 — Booking Policy Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 44 introduces a Booking Policy Boundary for evaluating configurable business conditions separately from Authorization permissions and Domain state-machine rules.

**Decision:**

* **Ownership:** `BookingPolicy`, `BookingPolicyRequest`, `PolicyDecision`, and `createBookingPolicy` live in `@motanos/booking` (`packages/engines/booking/src/policies/`). Policy belongs to the Booking Engine — not Application, not Runtime, and not a new top-level layer above Booking.
* **Coexistence with Authorization Policy:** `BookingAuthorizationPolicy` (DEC-BOOKING-AUTH-001) answers “may this actor perform this operation?” `BookingPolicy` answers “does this operation meet current business conditions?” (e.g. cancellation window). Domain Rules answer “is the state transition valid?” Do not merge.
* **Operations (foundation):** `booking.create`, `booking.confirm`, `booking.cancel`, `booking.reschedule`.
* **Contract shape:** Evaluation input requires opaque `tenantReference` and `actorReference`; optional `bookingReference` / `bookingTenantReference`; optional controlled `metadata`. Decision: `allowed`, optional `reason`, optional `policyReference`. No roles, JWT, tokens, emails, or secrets.
* **Tenant isolation:** Policies may be bound to a tenant; cross-tenant evaluation is denied. Booking tenant mismatch is denied.
* **Relation to Workflow:** Workflows may consult Booking Policy (DEC-BOOKING-WORKFLOW-001). Workflows must not mutate internal domain rules via Policy.
* **Application:** Forbidden `Application → Policy Provider`. Flow: Use Case → Booking Policy → Booking Service → Domain.
* **Domain Events:** No `policy.created|updated|denied` events or automatic audit dispatch in this foundation.
* **Runtime:** Composition root for future policy adapters only. No rules engines, feature flags, env-driven config tables, or admin panels in this foundation.
* **Deferred:** JSON/rules engines, pricing/billing/promotion rules, CMS, dynamic remote configuration.

**Rejected:** Mixing Policy with Authorization or Domain Rules; Application → Policy Provider; embedding secrets/PII; implementing a full rules engine in this phase.

---

## DEC-BOOKING-PRICING-001 — Booking Pricing Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 45 introduces a Pricing Boundary so Booking can express what economic condition / price applies to an operation, without coupling to Payment capture, Billing, Authorization, or Domain Rules. Aligns with `22_PAYMENT_ARCHITECT` separation: Pricing = “how much / what condition”; Payment = “how it is charged”.

**Decision:**

* **Ownership:** `BookingPricing`, `BookingPricingRequest`, `PricingDecision`, and `createBookingPricing` live in `@motanos/booking` (`packages/engines/booking/src/pricing/`). Pricing belongs to the Booking Engine — not Application, not Payment Boundary ownership, not Billing, and not a new top-level layer.
* **Separations:** Authorization = may they?; Policy = business conditions (DEC-BOOKING-POLICY-001); Pricing = what price applies?; Payment = how to process payment (DEC-BOOKING-PAYMENT-001); Domain = is the transition valid?
* **Operations (foundation):** `booking.create`, `booking.confirm`, `booking.reschedule`, `booking.cancel`.
* **Contract shape:** Request requires opaque `tenantReference` and `actorReference`; optional `bookingReference`, `resourceReference`, `membershipReference`, controlled `metadata`. Decision: `allowed`, `amountReference` (pricing value reference — not a gateway id), `currency`, optional `reason` / `pricingReference`. No cards, payment tokens, bank data, or credentials.
* **Tenant isolation:** Pricing may be bound to a tenant; cross-tenant evaluation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Workflow:** Workflows may consult Pricing then Booking operations (DEC-BOOKING-WORKFLOW-001). Workflows must not mutate pricing rules via this boundary.
* **Application:** Forbidden `Application → Pricing Provider`. Flow: Use Case → Booking Pricing → Booking Service → Domain.
* **Domain Events:** No `pricing.created|changed` or `price.calculated` events in this foundation.
* **Runtime:** Composition root for future pricing adapters only. No tax engines, coupons, promotions, billing integrations, or admin price panels in this foundation.
* **Deferred:** taxes, discounts, promotions, coupons, dynamic remote price catalogs, invoicing.

**Rejected:** BookingPricing → Payment vendor SDKs; mixing Pricing with Payment/Billing; Application → Pricing Provider; embedding card/secret data; implementing commercial pricing engines in this phase.

---

## DEC-BOOKING-DISCOUNT-001 — Booking Discount Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 46 introduces a Discount Boundary so Booking can express whether an economic reduction applies, without owning Pricing calculations, Payment capture, Billing, promotions engines, or Domain Rules. Aligns with `22_PAYMENT_ARCHITECT`: Discount = “what reduction applies”; Payment = “how the charge is processed”. Pricing Architect does not exist as an agent file; separation follows DEC-BOOKING-PRICING-001.

**Decision:**

* **Ownership:** `BookingDiscount`, `BookingDiscountRequest`, `DiscountDecision`, and `createBookingDiscount` live in `@motanos/booking` (`packages/engines/booking/src/discounts/`). Discount belongs to the Booking Engine — not Pricing ownership, not Payment, not Billing, and not a new top-level layer.
* **Pipeline relation:** Policy → Discount → Pricing → Payment. Discount does not replace Pricing; Pricing consumes reduction references when wired later.
* **Separations:** Authorization = may they?; Policy = conditions (DEC-BOOKING-POLICY-001); Discount = does a reduction apply?; Pricing = resulting price (DEC-BOOKING-PRICING-001); Payment = how to charge (DEC-BOOKING-PAYMENT-001); Domain = is the transition valid?
* **Operations (foundation):** `booking.create`, `booking.confirm`, `booking.reschedule`, `booking.cancel`.
* **Contract shape:** Request requires opaque `tenantReference` and `actorReference`; optional `bookingReference`, `membershipReference`, `resourceReference`, `pricingReference`, controlled `metadata`. Decision: `applied`, optional `discountReference` / `discountAmountReference` / `reason`. Economic fields are opaque domain references — not gateway or billing ids. No cards, tokens, private promo secrets, or PII.
* **Tenant isolation:** Discount may be bound to a tenant; cross-tenant evaluation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Workflow:** Workflows may consult Discount then Pricing (DEC-BOOKING-WORKFLOW-001). Workflows must not mutate discount catalogs via this boundary.
* **Application:** Forbidden `Application → Discount Provider`. Flow: Use Case → Discount Boundary → Pricing Boundary → Booking Service → Domain.
* **Domain Events:** No `discount.created|applied|removed` events in this foundation.
* **Runtime:** Composition root for future discount adapters only. No coupons, campaigns, loyalty points, CRM, or admin promotion panels in this foundation.
* **Deferred:** promotion systems, discount codes, marketing campaigns, loyalty, points, dynamic remote catalogs.

**Rejected:** Mixing Discount with Pricing/Payment/Billing; Application → Discount Provider; embedding secrets/PII; implementing coupons or campaigns in this phase.

---

## DEC-BOOKING-TAX-001 — Booking Tax Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 47 introduces a Tax Boundary so Booking can express fiscal applicability intents without implementing legal tax calculation, country schedules, tax authorities, Billing, or Payment capture. Aligns with `22_PAYMENT_ARCHITECT`: Tax = “what fiscal impact applies”; Payment = “how the charge is processed”.

**Decision:**

* **Ownership:** `BookingTax`, `BookingTaxRequest`, `TaxDecision`, factories, and `BookingTaxPort` live in `@motanos/booking` (`packages/engines/booking/src/taxes/`). Tax belongs to the Booking Engine — not Pricing, Discount, Payment, Billing, or a new top-level layer.
* **Pipeline relation:** Policy → Discount → Pricing → Tax → Payment. Tax must not call Payment, mutate Pricing, apply discounts, or decide permissions.
* **Separations:** Authorization = may they?; Policy = conditions; Discount = reduction; Pricing = resulting price; Tax = fiscal impact; Payment = how to charge; Domain = transition validity.
* **Kinds (foundation):** `booking.service_tax`, `booking.local_tax`, `booking.fee_tax`, `booking.vat_reference`. Internal kinds only — not legal country tax codes.
* **Contract shape:** Opaque `taxReference`, `tenantReference`, `amountReference`, `taxKind`; optional `bookingReference`, `actorReference`, controlled `metadata`. Decision: `taxApplicable`, `taxReference`, `amountReference`, optional `reason`. No tax ids, fiscal addresses, bank data, PII, or credentials.
* **Tenant isolation:** Tax may be bound to a tenant; cross-tenant evaluation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Workflow:** Workflows may consult Tax Boundary then Booking flow (DEC-BOOKING-WORKFLOW-001). Workflows must not call tax SDKs.
* **Application:** Forbidden `Application → Tax Provider`. Flow remains Use Case → Booking Service → Result; Tax enters via Booking Engine contracts when wired later.
* **Domain Events:** No `booking.tax_calculated` / `booking.tax_created` events in this foundation. Existing Booking domain events remain intact.
* **Runtime:** Composition root for future `Tax Port → Adapter`. No fiscal SDKs, env-driven tax config, or external tax authority connections in this foundation.
* **Deferred:** real tax math, VAT/country rules, tax authority integrations, Billing.

**Rejected:** Mixing Tax with Pricing/Discount/Payment; Application → Tax Provider; embedding fiscal PII/secrets; implementing legal tax engines in this phase.

---

## DEC-BOOKING-FEE-001 — Booking Fee Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 48 introduces a Fee Boundary so Booking can express additional-charge intents (service/platform/booking/convenience fees) without implementing commercial fee math, Billing, or Payment capture. Aligns with `22_PAYMENT_ARCHITECT`: Fee = “is there an additional charge?”; Payment = “how the charge is processed”.

**Decision:**

* **Ownership:** `BookingFee`, `BookingFeeRequest`, `FeeDecision`, factories, and `BookingFeePort` live in `@motanos/booking` (`packages/engines/booking/src/fees/`). Fee belongs to the Booking Engine — not Pricing, Discount, Tax, Payment, Billing, or a new top-level layer.
* **Pipeline relation:** Policy → Discount → Pricing → Fee → Tax → Payment. Fee must not mutate Pricing, substitute Discount, call Payment, or decide permissions.
* **Separations:** Discount = reduction; Pricing = base/resulting price; Fee = additional charges; Tax = fiscal impact (DEC-BOOKING-TAX-001); Payment = how to charge (DEC-BOOKING-PAYMENT-001).
* **Kinds (foundation):** `booking.service_fee`, `booking.platform_fee`, `booking.booking_fee`, `booking.convenience_fee`. Internal kinds only — not billing line catalogs.
* **Contract shape:** Opaque `feeReference`, `tenantReference`, `amountReference`, `feeKind`; optional `bookingReference`, `actorReference`, controlled `metadata`. Decision: `feeApplicable`, `feeReference`, `amountReference`, optional `reason`. No cards, invoices, bank data, PII, or credentials.
* **Tenant isolation:** Fee may be bound to a tenant; cross-tenant evaluation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Workflow:** Workflows may consult Fee Boundary then Booking flow (DEC-BOOKING-WORKFLOW-001). Workflows must not call fee providers/SDKs.
* **Application:** Forbidden `Application → Fee Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No `booking.fee_calculated` / `booking.fee_created` events in this foundation. Existing Booking domain events remain intact.
* **Runtime:** Composition root for future `Fee Port → Adapter`. No billing systems, fee SDKs, or env-driven fee catalogs in this foundation.
* **Deferred:** commercial commission engines, billing line generation, real fee math, provider integrations.

**Rejected:** Mixing Fee with Pricing/Discount/Tax/Payment; Application → Fee Provider; embedding secrets/PII; implementing billing fee engines in this phase.

---

## DEC-BOOKING-BALANCE-001 — Booking Balance Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 49 introduces a Balance Boundary so Booking can express pending economic state for a reservation without implementing wallets, ledgers, reconciliation, Billing, or Payment capture. Aligns with `22_PAYMENT_ARCHITECT`: Balance = “what is outstanding?”; Payment = “how the charge moves externally”.

**Decision:**

* **Ownership:** `BookingBalance`, `BookingBalanceRequest`, `BalanceDecision`, factories, and `BookingBalancePort` live in `@motanos/booking` (`packages/engines/booking/src/balances/`). Balance belongs to the Booking Engine — not Pricing, Fee, Tax, Payment, Accounting, or a new top-level layer.
* **Pipeline relation:** Discount → Pricing → Fee → Tax → Balance → Payment. Balance must not charge, mutate Payment, substitute Payment, or create a ledger.
* **Separations:** Pricing = calculated amount; Discount = reductions; Fee = additional charges; Tax = fiscal impact; Balance = pending economic state; Payment = external movement/capture.
* **Kinds (foundation):** `booking.remaining_balance`, `booking.deposit_balance`, `booking.refund_balance`, `booking.outstanding_balance`.
* **Statuses (foundation):** `pending`, `partial`, `settled`, `cancelled`.
* **Contract shape:** Opaque `balanceReference`, `tenantReference`, `amountReference`, `balanceKind`; optional `bookingReference`, `actorReference`, controlled `metadata`. Decision: `balanceReference`, `amountReference`, `balanceStatus`, optional `reason`. No bank accounts, cards, invoices, PII, or credentials.
* **Tenant isolation:** Balance may be bound to a tenant; cross-tenant evaluation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Workflow:** Workflows may consult Balance Boundary then Booking flow (DEC-BOOKING-WORKFLOW-001). Workflows must not call accounting providers.
* **Application:** Forbidden `Application → Accounting System`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No `booking.balance_created` / `booking.balance_updated` events in this foundation. Existing Booking domain events remain intact.
* **Runtime:** Composition root for future `Balance Port → Adapter`. No banks, ledgers, billing, or accounting SDKs in this foundation.
* **Deferred:** wallets, financial ledgers, reconciliation, invoicing, real settlement engines.

**Rejected:** Mixing Balance with Payment/Accounting; Application → Accounting Provider; embedding bank/card secrets; implementing ledgers in this phase.

---

## DEC-BOOKING-SETTLEMENT-001 — Booking Settlement Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 50 introduces a Settlement Boundary so Booking can express final economic liquidation state for a reservation without bank reconciliation, accounting ledgers, invoicing, or Payment capture. Aligns with `22_PAYMENT_ARCHITECT`: Balance = pending state; Payment = external charge movement; Settlement = whether liquidation is finalized.

**Decision:**

* **Ownership:** `BookingSettlement`, `BookingSettlementRequest`, `SettlementDecision`, factories, and `BookingSettlementPort` live in `@motanos/booking` (`packages/engines/booking/src/settlements/`). Settlement belongs to the Booking Engine — not Pricing, Fee, Tax, Balance, Payment, Accounting, or a new top-level layer.
* **Pipeline relation:** Discount → Pricing → Fee → Tax → Balance → Payment → Settlement. Settlement must not charge, substitute Payment, create a ledger, or mutate Balance.
* **Separations:** Pricing = calculated amount; Discount = reductions; Fee = additional charges; Tax = fiscal impact; Balance = pending amount; Payment = external capture; Settlement = finalized/liquidated state.
* **Kinds (foundation):** `booking.full_settlement`, `booking.partial_settlement`, `booking.deposit_settlement`, `booking.refund_settlement`.
* **Statuses (foundation):** `pending`, `processing`, `settled`, `failed`, `cancelled`.
* **Contract shape:** Opaque `settlementReference`, `tenantReference`, `amountReference`, `settlementKind`; optional `bookingReference`, `actorReference`, controlled `metadata`. Decision: `settlementReference`, `amountReference`, `settlementStatus`, optional `reason`. No bank accounts, cards, real invoices, PII, or credentials.
* **Tenant isolation:** Settlement may be bound to a tenant; cross-tenant evaluation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Workflow:** Workflows may consult Settlement Boundary then Booking flow (DEC-BOOKING-WORKFLOW-001). Workflows must not call accounting providers.
* **Application:** Forbidden `Application → Settlement Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No `booking.settlement_created` / `booking.settlement_completed` events in this foundation. Existing Booking domain events remain intact.
* **Runtime:** Composition root for future `Settlement Port → Adapter`. No banks, ledgers, billing, or accounting SDKs in this foundation.
* **Deferred:** bank reconciliation, financial ledgers, real settlement engines, provider webhooks.

**Rejected:** Mixing Settlement with Payment/Balance/Accounting; Application → Settlement Provider; embedding bank secrets; implementing real accounting in this phase.

---

## DEC-BOOKING-INVOICE-001 — Booking Invoice Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 51 introduces an Invoice Boundary so Booking can express economic document context for a reservation without billing engines, legal invoicing, PDF generation, fiscal numbering, Hacienda/ERP providers, or document storage. Aligns with `22_PAYMENT_ARCHITECT`: Payment = charge movement; Settlement = liquidation state; Invoice = document/context association.

**Decision:**

* **Ownership:** `BookingInvoice`, factories, and `BookingInvoicePort` live in `@motanos/booking` (`packages/engines/booking/src/invoices/`). Invoice belongs to the Booking Engine as a conceptual boundary — not Payment, Billing, Accounting, or Runtime.
* **Pipeline relation:** Discount → Pricing → Fee → Tax → Balance → Payment → Settlement → Invoice. Invoice consumes economic context; it must not calculate, charge, settle, or substitute Tax/Balance/Settlement/Payment.
* **Separations:** Tax = fiscal impact; Balance = pending amount; Payment = external capture; Settlement = finalized liquidation; Invoice = whether document context exists. Invoice ≠ Billing.
* **Kinds (foundation):** `booking.invoice`, `booking.receipt`, `booking.credit_note`, `booking.adjustment`.
* **Statuses (foundation):** `pending`, `generated`, `issued`, `cancelled`, `failed`.
* **Contract shape:** Opaque `invoiceReference`, `tenantReference`, `amountReference`, `invoiceKind`, `invoiceStatus`; optional `bookingReference`, `actorReference`, controlled `metadata`. No DNI/NIF, fiscal address, bank/card data, API keys, or tokens.
* **Tenant isolation:** Invoice may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Booking lifecycle:** May relate to created/confirmed/completed/cancelled bookings without mutating aggregate state machines (DEC-BOOKING / state-machines).
* **Relation to Workflow:** Workflows may consult Invoice Boundary then Booking flow (DEC-BOOKING-WORKFLOW-001). Workflows must not call Billing providers.
* **Application:** Forbidden `Application → Invoice Service`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No `booking.invoice_created` / `booking.invoice_issued` events in this foundation. Existing Booking domain events remain intact. Invoice Boundary does not emit events.
* **Runtime:** Composition root for future `Invoice Port → Adapter`. No PDF generators, ERP connectors, fiscal APIs, or billing SDKs in this foundation.
* **Deferred:** legal invoicing, PDF generation, fiscal numbering, document storage, Hacienda integration, accounting logic.

**Rejected:** Mixing Invoice with Billing/Payment/Settlement; Application → Invoice Provider; embedding PII/fiscal identity/secrets; implementing real billing in this phase.

---

## DEC-BOOKING-DOCUMENT-001 — Booking Document Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 52 introduces a Document Boundary so Booking can express associated document context without file storage, uploads, S3, PDFs, digital signatures, OCR, or a full DMS. Distinct from Invoice (economic/fiscal context), Payment, Settlement, Notification, and Integration providers.

**Decision:**

* **Ownership:** `BookingDocument`, factories, and `BookingDocumentPort` live in `@motanos/booking` (`packages/engines/booking/src/documents/`). Document belongs to the Booking Engine as a conceptual boundary — not Invoice, Payment, Runtime, or Storage.
* **Pipeline relation:** Pricing → Tax → Balance → Payment → Settlement → Invoice → Document. Document answers “is there an associated document?” — not price, payment, tax, or settlement state.
* **Separations:** Invoice = economic/fiscal document context; Document = associated document context (confirmation, contract, receipt, invoice_copy, attachment). Document ≠ Invoice; Document ≠ Payment.
* **Kinds (foundation):** `booking.confirmation`, `booking.receipt`, `booking.invoice_copy`, `booking.contract`, `booking.attachment`.
* **Statuses (foundation):** `pending`, `available`, `archived`, `expired`, `failed`.
* **Contract shape:** Opaque `documentReference`, `tenantReference`, `documentKind`, `documentStatus`; optional `bookingReference`, `actorReference`, opaque `contentReference`, controlled `metadata`. No binary content, private URLs, tokens, API keys, personal documents, or identity data.
* **Tenant isolation:** Document may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Booking lifecycle:** May relate to confirmation/completion/cancellation without mutating aggregate state machines.
* **Relation to Workflow:** Workflows may consult Document Boundary then Booking flow (DEC-BOOKING-WORKFLOW-001). Workflows must not call Storage providers.
* **Application:** Forbidden `Application → Document Service`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No `booking.document_created` / `booking.document_available` events in this foundation. Existing Booking domain events remain intact. Document Boundary does not emit events.
* **Runtime:** Composition root for future `Document Port → Adapter`. No S3, filesystem, cloud SDKs, CDN, or DMS in this foundation.
* **Deferred:** file storage, uploads, PDFs, digital signatures, OCR, full document management.

**Rejected:** Mixing Document with Invoice/Payment/Storage; Application → Document Provider; embedding content/private URLs/secrets; implementing real storage in this phase.

---

## DEC-BOOKING-APPROVAL-001 — Booking Approval Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 53 introduces an Approval Boundary so Booking can express a required business approval/authorization decision without real approvers, RBAC, digital signatures, human workflows, BPM engines, or notifications. Distinct from Authorization Policy (can the actor act?), Booking Policy (business conditions), Domain Rules (aggregate transition validity), and Workflow (step coordination).

**Decision:**

* **Ownership:** `BookingApproval`, factories, and `BookingApprovalPort` live in `@motanos/booking` (`packages/engines/booking/src/approvals/`). Approval belongs to the Booking Engine — not Authorization, Users, RBAC, Workflow Engine, or Runtime.
* **Pipeline relation:** Actor → Authorization Policy → Booking Policy → Approval Boundary → Domain Operation. Approval answers “is an approval decision required to continue?” — not permission, policy compliance, or aggregate validity.
* **Separations:** Authorization ≠ Approval (permission to confirm may still require additional approval). Approval ≠ Payment (approval may exist without payment). Approval ≠ Workflow Engine.
* **Kinds (foundation):** `booking.confirmation`, `booking.manual_review`, `booking.exception`, `booking.override`.
* **Statuses (foundation):** `pending`, `approved`, `rejected`, `expired`, `cancelled`.
* **Contract shape:** Opaque `approvalReference`, `tenantReference`, `approvalKind`, `approvalStatus`; optional `bookingReference`, `actorReference`, opaque `requestedByReference`, controlled `metadata`. No passwords, tokens, real roles, permissions matrices, or PII.
* **Tenant isolation:** Approval may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Booking lifecycle:** May relate to create/confirm/cancel/reschedule without mutating aggregate state machines.
* **Relation to Workflow:** Workflows may consult Approval Boundary then Booking flow (DEC-BOOKING-WORKFLOW-001). Workflows must not call external Approval Engines.
* **Application:** Forbidden `Application → Approval Service`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No `booking.approval_requested` / `booking.approval_completed` events in this foundation. Existing Booking domain events remain intact. Approval Boundary does not emit events.
* **Runtime:** Composition root for future `Approval Port → Adapter` (`requestApproval` / `evaluateApproval`). No workflow engines, users, roles, or BPM SDKs in this foundation.
* **Deferred:** real approvers, RBAC, human approval UIs, notifications, external approval providers.

**Rejected:** Mixing Approval with Authorization/RBAC/Workflow Engine; Application → Approval Provider; embedding roles/JWT/secrets; implementing human BPM in this phase.

---

## DEC-BOOKING-EXCEPTION-001 — Booking Exception Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 54 introduces an Exception Boundary so Booking can express registered special-case **business** situations that require treatment, without becoming Domain Errors, Authorization, Approval, Workflow Engines, Support Tickets, Incident Management, or a generic container for technical/infrastructure failures. Distinct from “can the actor?” (Authorization), “do conditions hold?” (Policy), “is the transition valid?” (Domain), and “who must approve?” (Approval).

**Decision:**

* **Ownership:** `BookingException`, factories, and `BookingExceptionPort` live in `@motanos/booking` (`packages/engines/booking/src/exceptions/`). Exception belongs to the Booking Engine — not Support, Incident, Approval, Authorization, or Runtime.
* **Scope:** `BookingException` represents **business exceptions of the Booking context**. It does **not** represent technical infrastructure errors. Payment failures, integration failures, persistence failures, and runtime/API failures remain in their own boundaries (Payment, Integration, Persistence/Runtime, API).
* **Pipeline relation:** Booking Domain → Exception Boundary → Approval (if applicable) → Workflow (if applicable) → Booking Operation. Never: Technical Error → Booking Exception. Exception answers “is there a registered special condition requiring treatment, and what is its status?”
* **Separations:** Domain Error = invalid operation; Exception = registered business situation needing treatment. Authorization ≠ Exception. Policy ≠ Exception (`resolveException` is not Policy evaluation). Approval ≠ Exception (an exception may later require approval). Exception ≠ Support Ticket / Incident.
* **Kinds (foundation):** `booking.conflict`, `booking.override_required`, `booking.manual_intervention`, `booking.business_exception`, `booking.operational_exception`. Technical/infrastructure failure kinds are rejected — they stay outside this boundary. `operational_exception` means an operational Booking-process situation, **not** server/API/provider/infrastructure failure.
* **Statuses (foundation):** `pending`, `resolved`, `dismissed`, `expired`, `cancelled`.
* **Contract shape:** Opaque `exceptionReference`, `tenantReference`, `exceptionKind`, `exceptionStatus`; optional `bookingReference`, `actorReference`, opaque `reasonReference`, controlled `metadata`. No passwords, tokens, API keys, PII, or full logs.
* **Tenant isolation:** Exception may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Workflow:** Workflows may consult Exception Boundary (DEC-BOOKING-WORKFLOW-001). Workflows must not call Exception Providers (tickets, Slack, Jira, email).
* **Application:** Forbidden `Application → Exception Service`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No new exception domain events in this foundation. Existing Booking domain events remain intact. Exception Boundary does not emit events.
* **Runtime:** Composition root for future `Exception Port → Adapter` (`registerException` / `resolveException`). No databases, tickets, emails, Slack, Jira, or external providers in this foundation.
* **Deferred:** real exception handlers, support/incident integrations, human intervention UIs.

**Rejected:** Mixing Exception with Domain Error/Authorization/Approval/Support/Incident/technical infrastructure errors; Policy-style evaluation on the Exception Port (use `resolveException` for status treatment only); Application → Exception Provider; embedding secrets/PII/full logs; implementing ticket systems in this phase.

---

## DEC-BOOKING-CANCELLATION-001 — Booking Cancellation Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 55 introduces a Cancellation Boundary so Booking can express cancellation intent/context for a reservation without mutating the Booking aggregate, processing refunds, sending notifications, or coordinating workflows. Distinct from Authorization/Policy (“may cancel?”), Domain transition (“status → cancelled”), Payment/Settlement (refund), Notification, and Workflow.

**Decision:**

* **Ownership:** `BookingCancellation`, factories, and `BookingCancellationPort` live in `@motanos/booking` (`packages/engines/booking/src/cancellations/`). Cancellation belongs to the Booking Engine as a conceptual boundary — not Domain state machine, Payment, Notification, or Runtime.
* **Pipeline relation:** Actor → Cancellation Boundary → Booking Policy → Domain Transition → Future Refund / Notification / Workflow. Cancellation answers “is there a cancellation intent/context for this booking?”
* **Separations:** Cancellation ≠ Domain Transition (does not change aggregate). Cancellation ≠ Policy (Policy decides; Cancellation is intent). Cancellation ≠ Approval (may precede Approval). Cancellation ≠ Refund / Payment / Settlement. Cancellation ≠ Notification. Cancellation ≠ Workflow.
* **Kinds (foundation):** `booking.customer_requested`, `booking.operator_requested`, `booking.policy_required`, `booking.exception_based`, `booking.operational`. `operational` is a Booking-process initiation — not a technical infrastructure error. `exception_based` may relate to Exception Boundary without substituting Approval.
* **Statuses (foundation):** `requested`, `approved`, `rejected`, `completed`, `cancelled` — intent statuses, not aggregate lifecycle states (`created` / `confirmed` / `cancel_requested` / `cancelled` remain in the domain state machine).
* **Contract shape:** Opaque `cancellationReference`, required `tenantReference` and `bookingReference`, `cancellationKind`, `cancellationStatus`; optional `actorReference`, opaque `reasonReference`, controlled `metadata`. No emails, phones, tokens, secrets, or payment data.
* **Tenant isolation:** Cancellation may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Relation to Workflow:** Workflows may consult Cancellation Boundary. Workflows must not be replaced by this boundary.
* **Application:** Forbidden `Application → Cancellation Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No new cancellation-intent domain events. Existing domain events (including domain-emitted cancellation facts) remain intact. Boundary intent ≠ Domain Event fact.
* **Runtime:** Composition root for future `Cancellation Port → Adapter` (`requestCancellation` / `completeCancellation`). No workers, queues, schedulers, persist, refund, email, or webhook adapters in this foundation.
* **Deferred:** real cancellation orchestration, refund wiring, notification dispatch, human operator UIs.

**Rejected:** Mixing Cancellation with Domain mutation/Refund/Payment/Notification/Workflow; Application → Cancellation Provider; embedding PII/payment secrets; implementing cancel aggregate transitions in this phase.

---

## DEC-BOOKING-RESCHEDULE-001 — Booking Reschedule Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 56 introduces a Reschedule Boundary so Booking can express reschedule intent/context for a reservation without mutating the Booking aggregate, checking real availability, recalculating price, adjusting payment, sending notifications, or coordinating workflows. Distinct from Cancellation (remove intent vs move intent), Availability Policy, Booking Policy, Domain transition, Pricing, and Payment.

**Decision:**

* **Ownership:** `BookingReschedule`, factories, and `BookingReschedulePort` live in `@motanos/booking` (`packages/engines/booking/src/reschedules/`). Reschedule belongs to the Booking Engine as a conceptual boundary — not Domain state machine, Availability provider, Pricing, Payment, Notification, or Runtime.
* **Pipeline relation:** Actor → Reschedule Boundary → Availability Policy → Booking Policy → Domain Transition → Future Pricing / Payment / Notification. Reschedule answers “is there an intent to change the scheduling of this booking?”
* **Separations:** Reschedule ≠ Cancellation (move vs remove). Reschedule ≠ Availability (may consult Availability later). Reschedule ≠ Policy. Reschedule ≠ Domain Transition. Reschedule ≠ Pricing / Payment / Refund. Reschedule ≠ Notification. Reschedule ≠ Workflow.
* **Kinds (foundation):** `booking.customer_requested`, `booking.operator_requested`, `booking.availability_required`, `booking.policy_required`, `booking.operational`. `operational` is a Booking-process initiation — not a technical infrastructure error.
* **Statuses (foundation):** `requested`, `approved`, `rejected`, `completed`, `cancelled` — intent statuses, not aggregate lifecycle states.
* **Contract shape:** Opaque `rescheduleReference`, required `tenantReference`, `bookingReference`, `currentStartReference`, `requestedStartReference`, `rescheduleKind`, `rescheduleStatus`; optional `actorReference`, opaque `reasonReference`, controlled `metadata`. Start fields are opaque references — not live external calendar datetimes. No PII, tokens, payment data, or credentials.
* **Tenant isolation:** Reschedule may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Application:** Forbidden `Application → Reschedule Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No new `booking.rescheduled` intent events from this boundary. Existing domain-emitted reschedule facts remain intact. Boundary intent ≠ Domain Event fact.
* **Runtime:** Composition root for future `Reschedule Port → Adapter` (`requestReschedule` / `completeReschedule`). No persist, availability providers, pricing engines, payment adjustments, or notification adapters in this foundation.
* **Deferred:** real reschedule orchestration, availability integration, price/payment adjustment, notification dispatch.

**Rejected:** Mixing Reschedule with Cancellation/Domain mutation/Availability/Pricing/Payment/Notification/Workflow; Application → Reschedule Provider; embedding PII/payment secrets; implementing aggregate window changes in this phase.

---

## DEC-BOOKING-MODIFICATION-001 — Booking Modification Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 57 introduces a Modification Boundary so Booking can express modification intent/context for an existing reservation without mutating the Booking aggregate, recalculating price, executing payment, sending notifications, or running workflows. Distinct from Reschedule (schedule move), Cancellation (remove), Authorization/Policy, Domain transition, Pricing, and Payment.

**Decision:**

* **Ownership:** `BookingModification`, factories, and `BookingModificationPort` live in `@motanos/booking` (`packages/engines/booking/src/modifications/`). Modification belongs to the Booking Engine as a conceptual boundary — not Domain state machine, Reschedule, Cancellation, Pricing, Payment, Notification, or Runtime.
* **Pipeline relation:** Actor → Modification Boundary → Booking Policy → Domain Transition → Future Pricing / Payment / Notification. Modification answers “is there an intent to modify this booking?”
* **Separations:** Modification ≠ Reschedule (general change vs schedule move; Reschedule may follow Modification). Modification ≠ Cancellation. Modification ≠ Authorization/Policy. Modification ≠ Domain Transition. Modification ≠ Pricing / Payment / Refund. Modification ≠ Notification. Modification ≠ Workflow.
* **Kinds (foundation):** `booking.customer_requested`, `booking.operator_requested`, `booking.business_required`, `booking.policy_required`, `booking.operational`. `operational` is a Booking-process initiation — not a technical infrastructure error.
* **Statuses (foundation):** `requested`, `approved`, `rejected`, `completed`, `cancelled` — intent statuses, not aggregate lifecycle states.
* **Contract shape:** Opaque `modificationReference`, required `tenantReference` and `bookingReference`, `modificationKind`, `modificationStatus`; optional `actorReference`, opaque `reasonReference`, controlled `metadata`. No PII, tokens, credentials, or payment data.
* **Tenant isolation:** Modification may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Application:** Forbidden `Application → Modification Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No new `booking.modified` intent events from this boundary. Existing domain events remain intact. Boundary intent ≠ Domain Event fact.
* **Runtime:** Composition root for future `Modification Port → Adapter` (`requestModification` / `completeModification`). No persist, pricing, payment, or notification adapters in this foundation.
* **Deferred:** real modification orchestration, field-level change catalogs, price/payment adjustment, notification dispatch.

**Rejected:** Mixing Modification with Reschedule/Cancellation/Domain mutation/Pricing/Payment/Notification/Workflow; Application → Modification Provider; embedding PII/payment secrets; implementing aggregate mutations in this phase.

---

## DEC-BOOKING-CHECKIN-001 — Booking Check-in Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 58 introduces a Check-in Boundary so Booking can express arrival/presentation context for a reservation without mutating the Booking aggregate, assigning resources/tables, opening sessions, billing, payment, notifications, or availability checks. Distinct from Confirmation (reservation accepted) and future Completion (visit ended).

**Decision:**

* **Ownership:** `BookingCheckIn`, factories, and `BookingCheckInPort` live in `@motanos/booking` (`packages/engines/booking/src/checkins/`). Check-in belongs to the Booking Engine as a conceptual boundary — not Domain state machine, Resource, Payment, Settlement, Notification, or Runtime.
* **Pipeline relation:** Actor → Check-in Boundary → Booking Policy → Domain Transition → Future Table / Service / Payment / Notification. Check-in answers “is there an arrival context for this booking?”
* **Separations:** Confirmation = reservation accepted; Check-in = guest arrived. Check-in ≠ Resource assignment (may follow later). Check-in ≠ Payment / Settlement. Check-in ≠ Notification. Check-in ≠ Availability. Check-in ≠ Workflow.
* **Kinds (foundation):** `booking.customer_arrival`, `booking.operator_assisted`, `booking.manual`, `booking.policy_required`, `booking.operational`. `operational` is a Booking-process initiation — not a technical infrastructure error.
* **Statuses (foundation):** `requested`, `approved`, `completed`, `rejected`, `cancelled` — intent statuses, not aggregate lifecycle states.
* **Contract shape:** Opaque `checkInReference`, required `tenantReference` and `bookingReference`, `checkInKind`, `checkInStatus`; optional `actorReference`, opaque `reasonReference`, controlled `metadata`. No PII, tokens, credentials, or payment data.
* **Tenant isolation:** Check-in may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Lifecycle relation:** create → confirm → check-in → complete (completion deferred). Does not mutate aggregate state machines in this foundation.
* **Application:** Forbidden `Application → Check-in Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No new check-in domain events from this boundary. Existing domain events remain intact. Boundary context ≠ Domain Event fact.
* **Runtime:** Composition root for future `Check-in Port → Adapter` (`requestCheckIn` / `completeCheckIn`). No persist, resource assignment, payment, or notification adapters in this foundation.
* **Deferred:** real check-in orchestration, table/resource assignment, service session opening, payment/notification wiring.

**Rejected:** Mixing Check-in with Confirmation/Resource/Payment/Settlement/Notification/Availability; Application → Check-in Provider; embedding PII/payment secrets; implementing aggregate or table assignment in this phase.

---

## DEC-BOOKING-NOSHOW-001 — Booking No-Show Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 59 introduces a No-Show Boundary so Booking can express absence context when the expected actor did not present for a reservation, without mutating the Booking aggregate, releasing resources, applying fees/penalties, charging, notifying, analytics, or workflows. Distinct from Cancellation (actor decides to cancel) and Check-in (actor arrived).

**Decision:**

* **Ownership:** `BookingNoShow`, factories, and `BookingNoShowPort` live in `@motanos/booking` (`packages/engines/booking/src/no-shows/`). No-Show belongs to the Booking Engine as a conceptual boundary — not Domain state machine, Cancellation, Check-in, Fee, Payment, Settlement, Resource, Notification, or Runtime.
* **Pipeline relation:** Booking Lifecycle → No-Show Boundary → Policy Evaluation → Domain Transition → Future Resource / Fee / Notification / Analytics. No-Show answers “is there a context where the booking was not attended due to actor absence?”
* **Separations:** Cancellation = actor decides to cancel; No-Show = actor does not appear. Check-in = actor arrived; No-Show = actor did not arrive. No-Show ≠ Fee (fee evaluation may follow). No-Show ≠ Payment / Settlement. No-Show ≠ Resource release. No-Show ≠ Notification. No-Show ≠ Workflow.
* **Kinds (foundation):** `booking.customer_absent`, `booking.operator_marked`, `booking.policy_required`, `booking.operational`, `booking.manual_review`. `operational` is a Booking-process initiation — not a technical infrastructure error.
* **Statuses (foundation):** `detected`, `review_pending`, `confirmed`, `rejected`, `cancelled` — treatment statuses, not aggregate lifecycle states.
* **Contract shape:** Opaque `noShowReference`, required `tenantReference` and `bookingReference`, `noShowKind`, `noShowStatus`; optional `actorReference`, opaque `reasonReference`, controlled `metadata`. No PII, tokens, credentials, or payment data.
* **Tenant isolation:** No-Show may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Lifecycle relation:** After confirm, path may proceed to check-in → complete, or to no-show. Does not mutate aggregate state machines in this foundation.
* **Application:** Forbidden `Application → No-Show Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No new no-show domain events from this boundary. Existing domain events remain intact. Boundary context ≠ Domain Event fact.
* **Runtime:** Composition root for future `No-Show Port → Adapter` (`registerNoShow` / `resolveNoShow`). No persist, resource release, fee, payment, or notification adapters in this foundation.
* **Deferred:** real no-show orchestration, resource release, fee/penalty evaluation, payment, notification, analytics.

**Rejected:** Mixing No-Show with Cancellation/Check-in/Fee/Payment/Settlement/Resource/Notification; Application → No-Show Provider; embedding PII/payment secrets; implementing aggregate or fee collection in this phase.

---

## DEC-BOOKING-COMPLETION-001 — Booking Completion Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 60 introduces a Completion Boundary so Booking can express finalization context when a booking experience has ended, without mutating the Booking aggregate, closing accounting, settling, charging, releasing resources, requesting reviews, analytics, or notifications. Distinct from Check-in (guest arrived) and Settlement (economic liquidation).

**Decision:**

* **Ownership:** `BookingCompletion`, factories, and `BookingCompletionPort` live in `@motanos/booking` (`packages/engines/booking/src/completions/`). Completion belongs to the Booking Engine as a conceptual boundary — not Domain state machine, Check-in, No-Show, Payment, Settlement, Invoice, Resource, Notification, or Runtime.
* **Pipeline relation:** Booking Lifecycle → Completion Boundary → Policy Evaluation → Domain Transition → Future Settlement / Resource / Notification / Analytics. Completion answers “is there a context where the booking experience has finished?”
* **Separations:** Check-in = guest arrived; Completion = service finished. Completion ≠ Settlement (settlement may follow). Completion ≠ Payment / Invoice. Completion ≠ Resource release. Completion ≠ Notification. Completion ≠ Workflow. Completion ≠ No-Show.
* **Kinds (foundation):** `booking.service_completed`, `booking.customer_completed`, `booking.operator_completed`, `booking.manual_review`, `booking.operational`. `operational` is a Booking-process initiation — not a technical infrastructure error.
* **Statuses (foundation):** `requested`, `approved`, `completed`, `rejected`, `cancelled` — intent statuses, not aggregate lifecycle states.
* **Contract shape:** Opaque `completionReference`, required `tenantReference` and `bookingReference`, `completionKind`, `completionStatus`; optional `actorReference`, opaque `reasonReference`, controlled `metadata`. No PII, tokens, credentials, or payment data.
* **Tenant isolation:** Completion may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Lifecycle relation:** create → confirm → check-in → complete; alternative paths cancel or no-show. Does not mutate aggregate state machines in this foundation.
* **Application:** Forbidden `Application → Completion Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No new completion-intent domain events from this boundary. Existing domain events remain intact. Boundary context ≠ Domain Event fact.
* **Runtime:** Composition root for future `Completion Port → Adapter` (`requestCompletion` / `completeCompletion`). No persist, settlement, payment, or resource-release adapters in this foundation.
* **Deferred:** real completion orchestration, settlement wiring, resource release, reviews, analytics, notifications.

**Rejected:** Mixing Completion with Check-in/Settlement/Payment/Invoice/Resource/Notification; Application → Completion Provider; embedding PII/payment secrets; implementing aggregate or accounting closure in this phase.

---

## DEC-BOOKING-WAITLIST-001 — Booking Waitlist Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 61 introduces a Waitlist Boundary so Booking can express a reservation intent that cannot yet become a Booking because availability is missing, without performing real availability search, resource assignment, automatic booking creation, notifications, ranking, auto-expiration, or payments. Waitlist belongs to the Booking Engine — not an Availability Engine.

**Decision:**

* **Ownership:** `BookingWaitlist`, factories, and `BookingWaitlistPort` live in `@motanos/booking` (`packages/engines/booking/src/waitlists/`). Waitlist is a conceptual boundary in the Booking Engine — not Availability Engine, Resource, Payment, Notification, or Runtime.
* **Pipeline relation:** No Availability → Waitlist Boundary → Availability Event → Future Booking Opportunity → Booking Creation. Waitlist answers “is there an intent waiting for a booking opportunity?”
* **Separations:** Waitlist ≠ Booking (may convert later). Availability decides if a slot exists; Waitlist waits for the opportunity. Waitlist ≠ Payment / Deposit. Waitlist ≠ Notification (notify may follow later). Waitlist ≠ Resource assignment.
* **Kinds (foundation):** `booking.customer_requested`, `booking.operator_created`, `booking.availability_required`, `booking.capacity_required`, `booking.operational`. `operational` is a Booking-process initiation — not a technical infrastructure error.
* **Statuses (foundation):** `waiting`, `notified`, `accepted`, `converted`, `expired`, `cancelled`.
* **Contract shape:** Opaque `waitlistReference`, required `tenantReference`, `waitlistKind`, `waitlistStatus`; optional `bookingReference` (may be absent — no Booking yet), `actorReference`, opaque `availabilityReference`, opaque `requestedDateReference`, controlled `metadata`. No PII, payment data, or credentials.
* **Tenant isolation:** Waitlist may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Application:** Forbidden `Application → Waitlist Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No new waitlist domain events from this boundary. Existing domain events remain intact. Boundary intent ≠ Domain Event fact.
* **Runtime:** Composition root for future `Waitlist Port → Adapter` (`requestWaitlist` / `resolveWaitlist`). No database, email, WhatsApp, push, ranking, or auto-expiration adapters in this foundation.
* **Deferred:** real availability integration, auto-convert to Booking, notifications, ranking, expiration workers.

**Rejected:** Mixing Waitlist with Availability Engine/Booking creation/Payment/Notification/Resource; Application → Waitlist Provider; embedding PII/payment secrets; implementing live availability search in this phase.

---

## DEC-BOOKING-RECURRENCE-001 — Booking Recurrence Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 62 introduces a Recurrence Boundary so Booking can express a repetition rule for a booking intent, without auto-generating bookings, mass reservation creation, calendar engines, availability checks, resource assignment, payments, or notifications. Recurrence belongs to the Booking Engine — not a Calendar Engine. Recurring booking ≠ recurring payment/subscription billing.

**Decision:**

* **Ownership:** `BookingRecurrence`, factories, and `BookingRecurrencePort` live in `@motanos/booking` (`packages/engines/booking/src/recurrences/`). Recurrence is a conceptual boundary in the Booking Engine — not Calendar Engine, Availability, Payment, Subscription Billing, Settlement, or Runtime.
* **Pipeline relation:** Recurrence Rule → Future Booking Instances → Booking Creation → Booking Lifecycle. Recurrence answers “is there a repetition rule associated with a booking intent?”
* **Separations:** Recurrence ≠ Booking (instances may be created later). Recurrence ≠ Calendar (calendar may interpret occurrences later). Recurrence ≠ Availability. Recurrence ≠ Payment / Subscription Billing / Settlement. Recurrence ≠ Notification.
* **Kinds (foundation):** `booking.weekly`, `booking.daily`, `booking.monthly`, `booking.custom`, `booking.operational`. `operational` is a Booking-process initiation — not a technical infrastructure error.
* **Statuses (foundation):** `draft`, `active`, `paused`, `completed`, `cancelled`, `expired` (e.g. draft → active ↔ paused, or active → completed).
* **Contract shape:** Opaque `recurrenceReference`, required `tenantReference`, `recurrenceKind`, `recurrenceStatus`; optional `bookingReference` (may be absent before instances), `actorReference`, opaque `patternReference`, `startReference`, `endReference`, controlled `metadata`. No PII, payment data, or credentials.
* **Tenant isolation:** Recurrence may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Application:** Forbidden `Application → Recurrence Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No new recurrence domain events from this boundary. Existing domain events remain intact. Boundary rule ≠ Domain Event fact.
* **Runtime:** Composition root for future `Recurrence Port → Adapter` (`createRecurrence` / `resolveRecurrence`). No cron, scheduler, database, or mass booking generators in this foundation.
* **Deferred:** occurrence materialization, calendar integration, auto booking creation, subscription/billing linkage.

**Rejected:** Mixing Recurrence with Calendar Engine/Booking auto-generation/Payment/Subscription Billing; Application → Recurrence Provider; embedding PII/payment secrets; implementing schedulers or mass booking creation in this phase.

---

## DEC-BOOKING-PARTICIPANT-001 — Booking Participant Boundary

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 63 introduces a Participant Boundary so Booking can express the relationship between a reservation and the people/entities involved, without user management, customer creation, profiles, identity/auth, individual payments, invitations, notifications, or permissions. Participant belongs to the Booking Engine — not Identity. Participant ≠ Payer / Payment Method / Billing Account.

**Decision:**

* **Ownership:** `BookingParticipant`, factories, and `BookingParticipantPort` live in `@motanos/booking` (`packages/engines/booking/src/participants/`). Participant is a conceptual boundary in the Booking Engine — not Identity/Auth, Membership, Payment, Notification, or Runtime. Package-root `BookingParticipant` is this boundary; the legacy domain party shape in `domain/booking.ts` is re-exported as `BookingAggregateParticipant` to avoid a name collision.
* **Pipeline relation:** Booking → Participant Boundary → Future Identity / Membership / Notification / Payment Context. Participant answers “is there a person or entity participant associated with a reservation?”
* **Separations:** Participant ≠ User/Identity. Participant ≠ Member/Membership. Participant ≠ Payment / Payer / Payment Method / Billing Account. Participant ≠ Notification. Participant ≠ Auth/Permissions.
* **Kinds (foundation):** `booking.primary`, `booking.guest`, `booking.attendee`, `booking.player`, `booking.staff`, `booking.operational`. `operational` is a Booking-process initiation — not a technical infrastructure error.
* **Statuses (foundation):** `invited`, `confirmed`, `checked_in`, `completed`, `cancelled`, `removed` (e.g. invited → confirmed → checked_in → completed).
* **Contract shape:** Opaque `participantReference`, required `tenantReference`, required `bookingReference` (participant always belongs to a booking), `participantKind`, `participantStatus`; optional `actorReference`, opaque `identityReference`, `membershipReference`, controlled `metadata`. No PII, passwords, tokens, or payment data.
* **Tenant isolation:** Participant may be bound to a tenant; cross-tenant creation is denied (DEC-BOOKING-TENANT-001).
* **Application:** Forbidden `Application → Participant Provider`. Flow remains Use Case → Booking Service → Result.
* **Domain Events:** No new participant domain events from this boundary. Existing domain events remain intact. Boundary rule ≠ Domain Event fact.
* **Runtime:** Composition root for future `Participant Port → Adapter` (`addParticipant` / `resolveParticipant`). No real users, auth, membership, or persistence adapters in this foundation.
* **Deferred:** identity resolution, membership linkage, invitation flows, per-participant payment, notifications.

**Rejected:** Mixing Participant with Identity/Auth/Membership/Payment/Notification; Application → Participant Provider; embedding PII/credentials/payment secrets; implementing live user or membership management in this phase.

---

## DEC-BOOKING-FREEZE-001 — Booking Boundary Freeze & Ecosystem Integration Map

**Status:** ACCEPTED

**Date:** 2026-08-02

**Context:** After the Booking foundation boundary phases (through Participant / Recurrence / Waitlist / lifecycle / commercial context), MotanOS needs to freeze the Booking model so Booking remains a connecting capability of the ecosystem — not the whole product, and not a dumping ground for Calendar, Availability, Resource, Membership, Community, Identity, or payment rails.

**Decision:**

* **Freeze:** No new Booking Boundaries without a DEC that explicitly revises this freeze. Canonical freeze document: `docs/project/BOOKING_BOUNDARY_FREEZE.md`.
* **Booking owns:** reservation lifecycle; operation intents (modification, reschedule, no-show, exception, approval, cancellation, check-in, completion); participants; recurrence rules; waitlist demand; commercial *context* attached to a booking; opaque policy/integration ports toward other engines.
* **Booking does not own:** users/community; identity/auth product; membership product; real payment/billing/accounting; calendar product; availability capacity engine; physical resource inventory; notification delivery; schedulers/cron/mass booking generators.
* **Intent ≠ execution:** derived operation boundaries express intent/context; they do not replace Booking Service transitions.
* **Commercial context ≠ Commerce Engine:** Pricing/Discount/Fee/Tax/Balance/Settlement/Invoice/Document stay as Booking-associated context; execution and ledgers belong to future Commerce.
* **Export surface:** package-root `BookingParticipant` is the Participant Boundary; legacy domain party shape is `BookingAggregateParticipant`.
* **Dependencies:** `@motanos/booking` remains limited to `@motanos/contracts` + `@motanos/core`; no vendor SDKs or secret material in the engine package.
* **Integration map:** Community / Experience / Booking / Commerce / Resource / Membership (and Identity, Notification, Calendar, Availability) integrate via opaque references, ports, and domain events composed in Runtime.

**Rejected:** Building Calendar/Availability/Resource/Membership/Community/Identity/Payment-rails engines inside `@motanos/booking`; Application → Provider shortcuts; treating Booking commercial context as a full billing system; adding further Booking Boundaries without revising this freeze.

---

## DEC-RESOURCE-BOUNDARY-001 — Resource Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 94 (evolving Fase 65) consolidates the Resource Boundary so MotanOS can represent operational resources within a business context — independently of availability, reservations, assigned users, payments, pricing, inventory, physical storage, calendars, and external providers. Resource answers “what operational resource exists within a business context?” — not when it may be used, who reserves it, or how it is charged. Per DEC-BOOKING-FREEZE-001, physical resource ownership must not live inside `@motanos/booking`. Booking only consumes opaque `resourceReference`.

**Decision:**

* **Ownership:** `Resource`, factories, and `ResourcePort` live in `@motanos/resource` (`packages/engines/resource`). Resource is an independent bounded context — not Catalog, Availability, Booking, Calendar, Pricing, Payment, Commerce, Inventory, Membership, Experience, Content, Asset, Template, Analytics, Identity, AI providers, or Database providers.
* **Pipeline relation:** Business Context → Resource Boundary → Future Availability / Booking Systems. Resource defines existence, tenant, kind, status, and related opaque refs only.
* **Separations:** Resource ≠ Catalog. Resource ≠ Availability. Resource ≠ Booking. Resource ≠ Pricing. Resource ≠ Payment. Resource ≠ Inventory / Calendar / Assignment engines. Resource Engine ≠ Booking Resource Boundary (Booking-side opaque context/policy only). Opaque refs only — never `bookingId`, `userId`, `calendarId`, `stripeId`, `databaseId`, `inventoryId`.
* **Kinds (foundation):** `resource.physical`, `resource.digital`, `resource.service`, `resource.staff`, `resource.location`, `resource.operational`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `archived`, `cancelled` (e.g. draft → active → inactive → archived).
* **Contract shape:** Opaque `resourceReference`, required `tenantReference`, `resourceKind`, `resourceStatus`; optional opaque `catalogReference`, `contextReference`, `parentResourceReference`, `ownerReference`, `locationReference`, `categoryReference`, `assetReference`, `nameReference`, `descriptionReference`, controlled `metadata`.
* **Tenant isolation:** Resource may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createResource` / `resolveResource` only. No assign, reserve, book, release, allocate, lock, schedule, calculateAvailability, syncInventory, or syncCalendar in this foundation.
* **Runtime:** Composition root for future `Resource Port → Adapter`. No process runners, AI clients, or cross-engine imports in this foundation.
* **Dependencies:** `@motanos/resource` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Resource Runtime, Availability/Booking handoff, hierarchy queries, inventory sync.

**Rejected:** Turning Resource into Booking, Availability, Calendar, Inventory, Payment, Assignment, or Scheduling; Resource → Catalog/Availability/Booking/Calendar/Pricing/Payment/Commerce/Inventory/Membership/Experience/Content/Asset/Template/Analytics/Identity/OpenAI/database imports; implementing reserve, assign, lock, or availability calculation in this phase.

---

## DEC-EXPERIENCE-BOUNDARY-001 — Experience Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 88 (evolving Fase 66) consolidates the Experience Boundary so MotanOS can represent business experience existence and context — independently of UI components, frontend pages, visual design, workflow execution, recommendations, notifications, analytics, automatic personalization, and AI. Experience answers “what experience exists for a given context?” — not how steps run, what to suggest, or how to communicate.

**Decision:**

* **Ownership:** Boundary `Experience`, factories, and `ExperiencePort` live in `@motanos/experience` (`packages/engines/experience/src/experiences/`). Experience remains independent of Workflow, Preference, Recommendation, Notification, Analytics, Identity, Membership, AI providers, and Database providers.
* **Pipeline relation:** Business / User / Tenant Context → Experience Boundary → Future Experience Runtime / Workflow / Recommendation. Experience defines existence, context, status, and kind only — it does not execute steps, automate, recommend, or communicate.
* **Separations:** Experience ≠ Workflow. Experience ≠ Preference. Experience ≠ Recommendation. Experience ≠ Notification. Experience ≠ Analytics. Experience ≠ UI framework / CRM / automation engine. Opaque refs only — never `bookingId`, `userId`, `memberId`, `workflowId`, `databaseId`.
* **Kinds (foundation):** `experience.customer`, `experience.member`, `experience.booking`, `experience.event`, `experience.operational`, `experience.business`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `archived`, `cancelled` (e.g. draft → active → inactive → archived).
* **Contract shape:** Opaque `experienceReference`, required `tenantReference`, `experienceKind`, `experienceStatus`; optional opaque `nameReference`, `descriptionReference`, `contextReference`, `ownerReference`, `parentExperienceReference`, `assetReference`, controlled `metadata`.
* **Tenant isolation:** Experience may be bound to a tenant; cross-tenant creation is denied.
* **Export surface:** Package-root `Experience` / `CreateExperienceInput` / `EXPERIENCE_STATUSES` / `isExperienceStatus` are the Boundary. Legacy provisional aggregate shapes remain re-exported as `ExperienceAggregate`, `CreateExperienceAggregateInput`, `EXPERIENCE_AGGREGATE_STATUSES`, `isExperienceAggregateStatus` under `src/legacy/` (DEC-EXPERIENCE-001..003).
* **Port surface:** `createExperience` / `resolveExperience` only. No executeExperience, runExperience, triggerExperience, personalizeExperience, recommendExperience, trackExperience, or analyzeExperience in this foundation.
* **Runtime:** Composition root for future `Experience Port → Adapter`. No process runners, AI clients, or cross-engine imports in this foundation.
* **Dependencies:** `@motanos/experience` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Experience Runtime, Workflow handoff, Recommendation/Notification linkage, Event Engine evolution.

**Rejected:** Turning Experience into UI/workflow/CRM/analytics/AI/recommendation/automation; Experience → Workflow/Preference/Recommendation/Notification/Analytics/Identity/Membership/OpenAI/database imports; implementing step execution or personalization in this phase.

---

## DEC-COMMUNITY-BOUNDARY-001 — Community Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 67 introduces the Community Engine so MotanOS can express belonging, groups, and social participation independently of Identity (who you are), Membership (commercial relationship), Experience (what is offered), and Booking (when you participate). Community must not become a social network product, and must not absorb Identity or Membership.

**Decision:**

* **Ownership:** `Community`, factories, and `CommunityPort` live in `@motanos/community` (`packages/engines/community`). Community is an independent bounded context — not Booking, Resource, Experience, Commerce, Identity, Membership, Auth, or Runtime adapters.
* **Pipeline relation:** Community Definition → Membership / Identity References → Experience Participation → Booking Interaction. Community answers “how do people belong and relate around the business?”
* **Separations:** Community ≠ Identity (no users/login/passwords). Community ≠ Membership (“you’re a member” vs “you’re in the group”). Community ≠ Experience (offering). Community ≠ Booking (moment). Community ≠ Payment / Notification. Community ≠ Social Engine feed/chat product in this phase.
* **Kinds (foundation):** `community.club`, `community.group`, `community.team`, `community.circle`, `community.network`, `community.operational`.
* **Statuses (foundation):** `draft`, `active`, `paused`, `archived`, `cancelled` (e.g. draft → active ↔ paused → archived).
* **Contract shape:** Opaque `communityReference`, required `tenantReference`, `communityKind`, `communityStatus`; optional opaque `nameReference`, `descriptionReference`, `ownerReference`, `actorReference`, `parentCommunityReference`, controlled `metadata`. No passwords, tokens, credentials, PII, or auth data.
* **Tenant isolation:** Community may be bound to a tenant; cross-tenant creation is denied.
* **Future refs:** May later hold opaque `identityReference`, `membershipReference`, `experienceReference`, `bookingReference` — never full foreign aggregates.
* **Port surface:** `createCommunity` / `resolveCommunity` only. No `addMember`, `removeMember`, `sendMessage`, `inviteUser`, or `manageUsers` in this foundation.
* **Runtime:** Composition root for future `Community Port → Adapter`. No member management, chat, invites, ranking, gamification, or vendor SDKs in this foundation.
* **Dependencies:** `@motanos/community` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** real members, invitations, messaging, ranking/gamification, Identity/Membership Runtime wiring.

**Rejected:** Absorbing Identity or Membership into Community; Community as a social network; Community → Booking/Auth/Payment/Experience/Resource imports; Application → Community Provider; implementing members, chat, invites, or persistence adapters in this phase.

---

## DEC-REPORTING-BOUNDARY-001 — Reporting Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 116 consolidates Reporting as a pure information-representation boundary — “what information representation exists?” — independently of Analytics capacity, Measurement values, Audit recording, dashboard rendering, PDF/document generation, exports, queries, storage, delivery/scheduling, and external providers. MotanOS needs an opaque reporting record so future Reporting Runtimes can plug in without absorbing Analytics or Notification. No prior `@motanos/reporting` motor existed to split.

**Decision:**

* **Ownership:** `Reporting`, factories, and `ReportingPort` live in `@motanos/reporting` (`packages/engines/reporting`). Reporting is an independent bounded context — not Analytics, Measurement, Audit, Notification, or Runtime.
* **Pipeline relation:** Analytics Boundary → Reporting Boundary → Future Reporting Runtime. Reporting answers “what information representation exists?”
* **Separations:** Reporting ≠ Analytics. Reporting ≠ Measurement. Reporting ≠ Audit. Reporting represents information, not technical generation or delivery. Opaque refs only — prepared for future presentation runtimes.
* **Kinds (foundation):** `reporting.business`, `reporting.operational`, `reporting.experience`, `reporting.domain`, `reporting.system`, `reporting.customer`, `reporting.internal`.
* **Statuses (foundation):** `draft`, `active`, `configured`, `published`, `archived`, `cancelled`.
* **Contract shape:** Opaque `reportingReference`, required `reportingKind`, `reportingStatus`; optional opaque `contextReference`, `actorReference`, `entityReference`, `entityKind`, `analyticsReference`, `measurementReference`, `eventReference`, `templateReference`, `parentReportingReference`, controlled `metadata`.
* **Scope isolation:** Optional bound context may require an exact opaque context reference match.
* **Port surface:** `createReporting` / `resolveReporting` only. No generateReport, renderReport, exportReport, createDashboard, executeQuery, calculateAnalytics, sendReport, scheduleReport, publishToProvider, or createDocument.
* **Dependencies:** `@motanos/reporting` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Reporting Runtime adapters. No `@motanos/reporting-lifecycle` in this phase.

**Rejected:** Absorbing Analytics/Measurement/Audit/Notification into Reporting; Reporting → dashboard/export/pdf/document/analytics/query/storage/delivery/provider/runtime imports; implementing generation, presentation, or outbound delivery in this phase.

---

## DEC-EVENT-BOUNDARY-001 — Event Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 113 consolidates Event as a pure domain-occurrence boundary — “what occurrence exists?” — independently of Audit recording, Workflow execution, Notification delivery, queue/handler infrastructure, analytics tracking, and technical event persistence. MotanOS needs an opaque event record so future Event Processing Runtimes can plug in without absorbing Audit or Workflow. No prior `@motanos/event` motor existed to split; legacy `@motanos/domain-events` remains domain scaffolding (not renamed to event-lifecycle in this phase).

**Decision:**

* **Ownership:** `Event`, factories, and `EventPort` live in `@motanos/event` (`packages/engines/event`). Event is an independent bounded context — not Audit, Workflow, Notification, Analytics, or Runtime.
* **Pipeline relation:** Context Boundary → Event Boundary → Future Event Processing Runtime. Event answers “what occurrence exists?”
* **Separations:** Event ≠ Audit. Event ≠ Workflow. Event ≠ Notification. Event represents occurrence, not execution. Opaque refs only — prepared for future processing runtimes.
* **Kinds (foundation):** `event.business`, `event.operational`, `event.domain`, `event.system`, `event.customer`, `event.experience`, `event.internal`.
* **Statuses (foundation):** `draft`, `active`, `processed`, `archived`, `cancelled`.
* **Contract shape:** Opaque `eventReference`, required `eventKind`, `eventStatus`; optional opaque `actorReference`, `contextReference`, `entityReference`, `entityKind`, `sourceReference`, `parentEventReference`, controlled `metadata`.
* **Scope isolation:** Optional bound context may require an exact opaque context reference match.
* **Port surface:** `createEvent` / `resolveEvent` only. No publishEvent, dispatchEvent, processEvent, executeWorkflow, sendNotification, createAudit, storeEvent, subscribeHandler, enqueueEvent, or analyzeEvent.
* **Dependencies:** `@motanos/event` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Event Processing Runtime adapters. Legacy `@motanos/domain-events` unchanged. No `@motanos/event-lifecycle` in this phase.

**Rejected:** Absorbing Audit/Workflow/Notification into Event; Event → audit/workflow/notification/analytics/runtime/queue/handler imports; implementing publish, dispatch, technical store, or listener wiring in this phase.

---

## DEC-CONTEXT-BOUNDARY-001 — Context Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 112 consolidates Context as a pure ambit-representation boundary — “under which scope does something exist?” — independently of Tenant existence, Identity, Actor participation, Authentication, Session, Permissions, Membership, Policy evaluation, Workflow runs, Configuration application, and domain execution. MotanOS needs an opaque context record so domain engines can bind entities / actions / experiences to an ambit without absorbing Tenant or Actor behavior. No prior `@motanos/context` motor existed to split.

**Decision:**

* **Ownership:** `Context`, factories, and `ContextPort` live in `@motanos/context` (`packages/engines/context`). Context is an independent bounded context — not Tenant, Actor, Identity, Permissions, Policy, Workflow, or Configuration.
* **Pipeline relation:** Actor Boundary → Context Boundary → Domain Engines / Future Execution Context. Context answers “under which ambit does something occur?”
* **Separations:** Context ≠ Tenant. Context ≠ Actor. Context ≠ Domain Execution. Context represents ambit, not behavior. Opaque refs only — prepared for future business contexts.
* **Kinds (foundation):** `context.tenant`, `context.business`, `context.operational`, `context.experience`, `context.event`, `context.system`, `context.internal`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `suspended`, `archived`, `cancelled`.
* **Contract shape:** Opaque `contextReference`, required `contextKind`, `contextStatus`; optional opaque `tenantReference`, `actorReference`, `organizationReference`, `entityReference`, `entityKind`, `parentContextReference`, controlled `metadata`.
* **Scope isolation:** Optional bound scope may require an exact opaque scope reference match.
* **Port surface:** `createContext` / `resolveContext` only. No createTenant, createIdentity, createActor, authenticate, createSession, assignPermission, evaluatePolicy, executeWorkflow, applyConfiguration, or runProcess.
* **Dependencies:** `@motanos/context` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Domain engine wiring and future business-context adapters. No `@motanos/context-lifecycle` in this phase.

**Rejected:** Absorbing Tenant/Actor/Execution into Context; Context → tenant/identity/actor/permission/membership/workflow/policy/configuration/runtime imports; implementing behavior, rule evaluation, or process runs in this phase.

---

## DEC-ACTOR-BOUNDARY-001 — Actor Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 111 consolidates Actor as a pure participant-representation boundary — “who acts?” — independently of Identity existence, Authentication proof schemes, Session temporal presence, Permissions capacity, Membership belonging, Policy evaluation, Workflow runs, and Tenant provisioning. MotanOS needs an opaque actor record so domain actions / future execution contexts can reference participants without absorbing Identity or Authentication. No prior `@motanos/actor` motor existed to split.

**Decision:**

* **Ownership:** `Actor`, factories, and `ActorPort` live in `@motanos/actor` (`packages/engines/actor`). Actor is an independent bounded context — not Identity, Authentication, Session, Permissions, Membership, Policy, or Workflow.
* **Pipeline relation:** Identity Boundary → Actor Boundary → Domain Actions / Future Execution Context. Actor answers “who participates in an action?”
* **Separations:** Actor ≠ Identity. Actor ≠ Authentication. Actor ≠ Session. Opaque refs only — prepared to represent domain participants without proving identity or assigning capacity.
* **Kinds (foundation):** `actor.person`, `actor.organization`, `actor.service`, `actor.system`, `actor.external`, `actor.operational`, `actor.business`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `suspended`, `archived`, `cancelled`.
* **Contract shape:** Opaque `actorReference`, required `actorKind`, `actorStatus`; optional opaque `identityReference`, `tenantReference`, `organizationReference`, `contextReference`, `parentActorReference`, controlled `metadata`.
* **Scope isolation:** Optional bound scope may require an exact opaque scope reference match.
* **Port surface:** `createActor` / `resolveActor` only. No createIdentity, authenticate, createSession, assignPermission, grantAccess, evaluatePolicy, executeAction, or runWorkflow.
* **Dependencies:** `@motanos/actor` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Domain action wiring and future execution-context adapters. No `@motanos/actor-lifecycle` in this phase.

**Rejected:** Absorbing Identity/Authentication/Session/Permissions into Actor; Actor → identity/authentication/session/permission/membership/workflow imports; implementing proof checks, capacity grants, or process runs in this phase.

---

## DEC-SESSION-BOUNDARY-001 — Session Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 110 consolidates Session as a pure temporal-interaction-existence boundary — “what session exists?” — independently of Authentication proof schemes, Identity creation, credential validation, token issuance, cookie/storage keep-alive, Permissions, Membership, and Tenant provisioning. MotanOS needs an opaque session record so future Session Runtimes can plug in without absorbing Authentication or Identity. No prior `@motanos/session` motor existed to split.

**Decision:**

* **Ownership:** `Session`, factories, and `SessionPort` live in `@motanos/session` (`packages/engines/session`). Session is an independent bounded context — not Authentication, Identity, Session Runtime, Permissions, Membership, or Tenant.
* **Pipeline relation:** Authentication Boundary → Session Boundary → Future Session Runtime. Session answers “what temporal interaction exists?”
* **Separations:** Session ≠ Authentication. Session ≠ Identity. Session ≠ Runtime. Opaque refs only — never live tokens, cookies, storage, or provider SDKs.
* **Kinds (foundation):** `session.user`, `session.service`, `session.system`, `session.external`, `session.operational`, `session.business`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `expired`, `suspended`, `archived`, `cancelled`.
* **Contract shape:** Opaque `sessionReference`, required `sessionKind`, `sessionStatus`; optional opaque `identityReference`, `authenticationReference`, `tenantReference`, `contextReference`, `deviceReference`, `parentSessionReference`, controlled `metadata`.
* **Scope isolation:** Optional bound scope may require an exact opaque scope reference match.
* **Port surface:** `createSession` / `resolveSession` only. No startSession, endSession, refreshSession, issueToken, revokeToken, persistSession, authenticate, createIdentity, or assignPermission.
* **Dependencies:** `@motanos/session` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Session Runtime adapters and technical keep-alive mechanisms. No `@motanos/session-lifecycle` in this phase.

**Rejected:** Absorbing Authentication/Identity/Runtime into Session; Session → authentication/identity/token/storage/permission/membership/tenant imports; implementing real start/end, renewal, or durable keep-alive in this phase.

---

## DEC-AUTHENTICATION-BOUNDARY-001 — Authentication Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 109 consolidates Authentication as a pure proof-of-identity boundary — “how does an actor prove who they are?” — independently of Identity creation, Session Runtime, credential storage, token issuance, OAuth provider administration, Permissions, Membership, Tenant provisioning, Billing, and Workflows. MotanOS needs an opaque authentication record so future Authentication Runtimes / external rails can plug in without absorbing Identity or Membership. No `@motanos/authentication` motor existed to split; legacy `@motanos/auth` remains historical runtime scaffolding (not renamed to authentication-lifecycle in this phase).

**Decision:**

* **Ownership:** `Authentication`, factories, and `AuthenticationPort` live in `@motanos/authentication` (`packages/engines/authentication`). Authentication is an independent bounded context — not Identity, Session Runtime, Permissions, Membership, Tenant, or Policy.
* **Pipeline relation:** Identity Boundary → Authentication Boundary → Future Authentication Runtime. Authentication answers “how is identity proved?”
* **Separations:** Authentication ≠ Identity. Authentication ≠ Session Runtime. Authentication ≠ Permissions. Authentication ≠ Membership. Opaque refs only — never live credentials, sessions, tokens, or provider SDKs.
* **Kinds (foundation):** `authentication.password`, `authentication.external`, `authentication.service`, `authentication.system`, `authentication.operational`, `authentication.business`.
* **Statuses (foundation):** `draft`, `pending`, `active`, `inactive`, `failed`, `suspended`, `archived`, `cancelled`.
* **Contract shape:** Opaque `authenticationReference`, required `authenticationKind`, `authenticationStatus`; optional opaque `identityReference`, `tenantReference`, `actorReference`, `methodReference`, `contextReference`, `providerReference`, `sessionReference`, `parentAuthenticationReference`, controlled `metadata`.
* **Scope isolation:** Optional bound scope may require an exact opaque scope reference match.
* **Port surface:** `createAuthentication` / `resolveAuthentication` only. No authenticate, login, logout, createSession, validateCredential, issueToken, refreshToken, connectProvider, recoverAccess, or createIdentity.
* **Dependencies:** `@motanos/authentication` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Authentication Runtime adapters, external rail wiring, Session Runtime. Legacy `@motanos/auth` unchanged. No `@motanos/authentication-lifecycle` in this phase.

**Rejected:** Absorbing Identity/Session/Permissions/Membership into Authentication; Authentication → identity/session/token/credential/provider/membership/tenant imports; implementing real sign-in, credential validation, or session creation in this phase.

---

## DEC-IDENTITY-BOUNDARY-001 — Identity Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 108 (evolving Fase 68) consolidates Identity as a pure actor-existence boundary — “who exists?” — independently of authentication, sessions, passwords, tokens, OAuth providers, credentials, permissions, roles, memberships, tenant creation, and policy execution. MotanOS needs an opaque identity record so future Authentication Runtimes can plug in without absorbing Membership or Permissions. No identity-lifecycle split was required: `@motanos/identity` was already a slim boundary.

**Decision:**

* **Ownership:** `Identity`, factories, and `IdentityPort` live in `@motanos/identity` (`packages/engines/identity`). Identity is an independent bounded context — not Authentication, Membership, Permissions, Tenant, or Policy.
* **Pipeline relation:** Tenant Context → Identity Boundary → Future Authentication Runtime. Identity answers “who exists?”
* **Separations:** Identity ≠ Authentication. Identity ≠ Membership. Identity ≠ Permissions. Identity ≠ Tenant. Opaque refs only — never live sessions, tokens, passwords, or credential material.
* **Kinds (foundation):** `identity.person`, `identity.organization`, `identity.service`, `identity.system`, `identity.external`, `identity.operational`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `suspended`, `archived`, `cancelled`.
* **Contract shape:** Opaque `identityReference`, required `identityKind`, `identityStatus`; optional opaque `tenantReference`, `actorReference`, `organizationReference`, `profileReference`, `externalReference`, `contextReference`, `parentIdentityReference`, controlled `metadata`.
* **Scope isolation:** Optional bound scope may require an exact opaque scope reference match.
* **Port surface:** `createIdentity` / `resolveIdentity` only. No authenticate, login, createSession, validatePassword, issueToken, refreshToken, connectOAuthProvider, assignRole, createMembership, or createTenant.
* **Dependencies:** `@motanos/identity` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Authentication Runtime adapters, provider wiring. No `@motanos/identity-lifecycle` in this phase.

**Rejected:** Absorbing Authentication/Membership/Permissions into Identity; Identity → Auth/session/token/provider/membership/tenant imports; implementing sign-in, sessions, or credential validation in this phase.

---

## DEC-MEMBERSHIP-BOUNDARY-001 — Membership Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 99 (evolving Fase 69) consolidates Membership as a pure belonging-relation boundary — “what belonging relation exists between an actor and a context?” — independently of who the person is (Identity), sign-in, access control / technical roles, quota charging, Billing, recommendations, and social Community. Multi-tenant MotanOS requires Membership to stay opaque and tenant-scoped so Community / Experience / Commerce can consume belonging without absorbing Identity or Permissions. No membership-lifecycle split was required: `@motanos/membership` was already a slim boundary.

**Decision:**

* **Ownership:** `Membership`, factories, and `MembershipPort` live in `@motanos/membership` (`packages/engines/membership`). Membership is an independent bounded context — not Identity, Permissions, Billing, Payment, Community, or Runtime adapters.
* **Pipeline relation:** Identity → Membership Boundary → Community / Experience / Commerce. Membership answers “what belonging exists?”
* **Separations:** Membership ≠ Identity. Membership ≠ Permissions. Membership ≠ Billing. Membership ≠ Payment. Opaque refs only — never live person profiles, credential material, or economic documents.
* **Kinds (foundation):** `membership.member`, `membership.customer`, `membership.club`, `membership.organization`, `membership.subscription`, `membership.operational`, `membership.business`.
* **Statuses (foundation):** `draft`, `pending`, `active`, `suspended`, `cancelled`, `expired`, `archived`.
* **Contract shape:** Opaque `membershipReference`, required `tenantReference`, `membershipKind`, `membershipStatus`; optional opaque `actorReference`, `customerReference`, `organizationReference`, `contextReference`, `planReference`, `parentMembershipReference`, controlled `metadata`.
* **Tenant isolation:** Membership may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createMembership` / `resolveMembership` only. No createUser, assignRole, grantPermission, chargeMembership, createSubscription, inviteMember, or authenticate.
* **Dependencies:** `@motanos/membership` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Community/Experience wiring, plan catalogs, charging linkage. No `@motanos/membership-lifecycle` in this phase.

**Rejected:** Turning Membership into Identity, RBAC, Billing, or Community; Membership → Identity/Auth/Permissions/Payment/Billing imports; implementing user creation, role assignment, charging, or invites in this phase.

---

## DEC-AVAILABILITY-BOUNDARY-001 — Availability Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 93 (evolving Fase 70) consolidates the Availability Boundary so MotanOS can represent when availability exists for a business context — independently of reservations, user calendars, external agendas, resource locking, booking, payments, pricing, physical resources, and calendar providers. Availability answers “when does applicable availability exist for a business context?” — not who reserves, what physical asset exists, or how to sync external calendars. Distinct from the Booking Availability Policy Boundary (opaque policy context inside `@motanos/booking`).

**Decision:**

* **Ownership:** `Availability`, factories, and `AvailabilityPort` live in `@motanos/availability` (`packages/engines/availability`). Availability is an independent bounded context — not Catalog, Booking, Resource, Calendar, Pricing, Payment, Commerce, Experience, Content, Asset, Template, Analytics, Identity, Membership, AI providers, or Database providers.
* **Pipeline relation:** Business Context / Resource Context → Availability Boundary → Future Booking / Scheduling Systems. Availability defines existence, tenant/context, kind, and status only.
* **Separations:** Availability ≠ Catalog. Availability ≠ Booking. Availability ≠ Resource. Availability ≠ Calendar. Availability ≠ Pricing. Availability ≠ Payment. Availability Engine ≠ Booking Availability Policy Boundary. Opaque refs only — never `bookingId`, `calendarEventId`, `googleCalendarId`, `databaseId`, `reservationId`.
* **Kinds (foundation):** `availability.resource`, `availability.service`, `availability.experience`, `availability.booking`, `availability.operational`, `availability.schedule`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `archived`, `cancelled` (e.g. draft → active → inactive → archived).
* **Contract shape:** Opaque `availabilityReference`, required `tenantReference`, `availabilityKind`, `availabilityStatus`; optional opaque `catalogReference`, `resourceReference`, `contextReference`, `scheduleReference`, `dateReference`, `timeReference`, `ownerReference`, `parentAvailabilityReference`, controlled `metadata`.
* **Tenant isolation:** Availability may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createAvailability` / `resolveAvailability` only. No book, reserve, schedule, block, lock, assign, syncCalendar, createEvent, or checkBooking in this foundation.
* **Runtime:** Composition root for future `Availability Port → Adapter`. No process runners, AI clients, Google/Outlook adapters, or cross-engine imports in this foundation.
* **Dependencies:** `@motanos/availability` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Availability Runtime, Booking/Scheduling handoff, free/busy evaluation, external calendar sync.

**Rejected:** Turning Availability into Booking, Calendar, Resource, Scheduling, Reservation, Payment, or Google/Outlook integration; Availability → Catalog/Booking/Resource/Calendar/Pricing/Payment/Commerce/Experience/Content/Asset/Template/Analytics/Identity/Membership/OpenAI/database imports; implementing reserve, block, assign, or calendar sync in this phase.

---

## DEC-CALENDAR-BOUNDARY-001 — Calendar Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 71 introduces the Calendar Engine so MotanOS can represent business events and temporal references independently of Booking (usage intent), Availability (when something may be used), and Experience (what is offered). An event can exist without bookings. Calendar must not become Booking or Experience.

**Decision:**

* **Ownership:** `CalendarEvent`, factories, and `CalendarPort` live in `@motanos/calendar` (`packages/engines/calendar`). Calendar is an independent bounded context — not Booking, Availability, Resource, Experience, Community, Commerce, Auth, or Runtime adapters.
* **Pipeline relation:** Calendar Definition → Calendar Event → Experience / Community / Resource References → Future Participation / Booking / Commerce. Calendar answers “what occurs and when?”
* **Separations:** Calendar ≠ Booking (event may exist without reservations). Calendar ≠ Availability (events may consume usable windows later; they do not define them). Calendar ≠ Experience (one offering may have many occurrences).
* **Kinds (foundation):** `calendar.event`, `calendar.session`, `calendar.activity`, `calendar.tournament`, `calendar.maintenance`, `calendar.operational`.
* **Statuses (foundation):** `draft`, `scheduled`, `active`, `completed`, `cancelled`, `archived` (e.g. draft → scheduled → active → completed).
* **Contract shape:** Opaque `eventReference`, required `tenantReference`, `eventKind`, `eventStatus`; optional opaque `nameReference`, `descriptionReference`, `experienceReference`, `resourceReference`, `communityReference`, `startReference`, `endReference`, controlled `metadata`. No passwords, tokens, OAuth material, or credentials.
* **Tenant isolation:** Calendar events may be bound to a tenant; cross-tenant creation is denied.
* **Future refs:** May later hold opaque `bookingReference` — never full foreign aggregates.
* **Port surface:** `createCalendarEvent` / `resolveCalendarEvent` only. No createBooking, reserve, checkAvailability, sendReminder, or external calendar sync in this foundation.
* **Runtime:** Composition root for future `Calendar Port → Adapter`. No database, Google/Outlook adapters, cron, or reminders in this foundation.
* **Dependencies:** `@motanos/calendar` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** occurrence materialization, Availability consumption, Booking/Experience Runtime wiring, external calendar sync.

**Rejected:** Turning Calendar into Booking or Experience; Calendar → Booking/Availability/Payment/OAuth imports; Application → Calendar Provider; implementing sync, reminders, or persistence adapters in this phase.

---

## DEC-COMMERCE-BOUNDARY-001 — Commerce Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 96 (evolving Fase 72) consolidates Commerce as a pure commercial-operation boundary — “what commercial operation exists?” — independently of how money is collected, what economic value applies, how fiscal records are written, how payment is processed, how goods are fulfilled, and how availability is calculated. No commerce-lifecycle split was required: `@motanos/commerce` was already a slim boundary package without payment/invoice/checkout motors.

**Decision:**

* **Ownership:** `Commerce`, factories, and `CommercePort` live in `@motanos/commerce` (`packages/engines/commerce`). Commerce is an independent bounded context — not Catalog, Pricing, Payment, Billing, Booking, Stripe, or Runtime adapters.
* **Pipeline relation:** Catalog → Commerce Boundary → Pricing → Payment → Billing. Commerce answers “what commercial operation exists?”
* **Separations:** Commerce ≠ Catalog. Commerce ≠ Pricing. Commerce ≠ Payment. Commerce ≠ Billing. No checkout, charge, pay, invoice, calculatePrice, createSubscription, or refund methods in this foundation.
* **Kinds (foundation):** `commerce.order`, `commerce.purchase`, `commerce.subscription`, `commerce.membership`, `commerce.booking`, `commerce.operational`, `commerce.business`.
* **Statuses (foundation):** `draft`, `pending`, `confirmed`, `completed`, `cancelled`, `archived`.
* **Contract shape:** Opaque `commerceReference`, required `tenantReference`, `commerceKind`, `commerceStatus`; optional opaque `catalogReference`, `customerReference`, `actorReference`, `bookingReference`, `pricingReference`, `contextReference`, `parentCommerceReference`, controlled `metadata`.
* **Tenant isolation:** Commerce may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createCommerce` / `resolveCommerce` only.
* **Dependencies:** `@motanos/commerce` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Commerce Runtime, Payment/Billing handoff, subscription engines, checkout UX. No `@motanos/commerce-lifecycle` in this phase.

**Rejected:** Absorbing Payment/Billing/Pricing/Checkout into Commerce; Commerce → Stripe/PayPal/Payment/Invoice/Billing/Pricing imports; implementing charge/refund/checkout/invoice adapters in this phase.

---

## DEC-PAYMENT-BOUNDARY-001 — Payment Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 97 (evolving Fase 73) consolidates Payment as a pure payment-operation boundary — “what payment operation exists within a context?” — independently of how collection is executed externally, which rail is used, checkout UX, fiscal registration, taxes, pricing, discounts, and commercial subscriptions. Multi-country MotanOS requires Payment to stay rail-agnostic so Stripe/Adyen/banks can plug in later as adapters. No payment-lifecycle split was required: `@motanos/payment` was already a slim boundary without vendor SDKs. Distinct from legacy `@motanos/payments` and from Booking Payment Boundary inside `@motanos/booking-lifecycle`.

**Decision:**

* **Ownership:** `Payment`, factories, and `PaymentPort` live in `@motanos/payment` (`packages/engines/payment`). Payment is an independent bounded context — not Commerce, Pricing, Billing, Booking, Stripe/PayPal, or Runtime adapters.
* **Pipeline relation:** Commerce → Payment Boundary → Payment Provider Adapter (future) → Billing (future). Payment answers “what payment exists?”
* **Separations:** Payment ≠ Commerce. Payment ≠ Pricing. Payment ≠ Billing. Payment ≠ Provider/Adapter. Opaque refs only — never live vendor sessions, cards, or fiscal documents.
* **Kinds (foundation):** `payment.purchase`, `payment.subscription`, `payment.membership`, `payment.booking`, `payment.refund`, `payment.operational`, `payment.business`.
* **Statuses (foundation):** `draft`, `pending`, `authorized`, `completed`, `failed`, `cancelled`, `refunded`, `archived`.
* **Contract shape:** Opaque `paymentReference`, required `tenantReference`, `paymentKind`, `paymentStatus`; optional opaque `commerceReference`, `bookingReference`, `customerReference`, `actorReference`, `currencyReference`, `amountReference`, `providerReference`, `contextReference`, `parentPaymentReference`, controlled `metadata`.
* **Tenant isolation:** Payment may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createPayment` / `resolvePayment` only. No charge, capture, refundProvider, checkout, createInvoice, calculateAmount, connectStripe, or syncProvider.
* **Dependencies:** `@motanos/payment` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** provider adapters, capture/charge execution, Billing linkage, webhook handling. No `@motanos/payment-lifecycle` in this phase.

**Rejected:** Absorbing Commerce/Billing/Pricing into Payment; Payment → Stripe/PayPal/provider/checkout/invoice/billing/pricing imports; implementing charge/capture/checkout/refund execution in this phase.

---

## DEC-BILLING-BOUNDARY-001 — Billing Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 98 introduces Billing as a pure economic/fiscal-record boundary — “what billing record exists?” — independently of how documents are rendered (PDF), how invoices are sent, how taxes are calculated, how fiscal providers connect, and how Payment collects money. Multi-country MotanOS requires Billing to stay jurisdiction-agnostic so country-specific fiscal adapters can plug in later. No prior `packages/engines/billing` existed; the package is created as a slim boundary. No `@motanos/billing-lifecycle` split was required.

**Decision:**

* **Ownership:** `Billing`, factories, and `BillingPort` live in `@motanos/billing` (`packages/engines/billing`). Billing is an independent bounded context — not Payment, Pricing, Commerce, Stripe invoicing, fiscal providers, or Runtime adapters.
* **Pipeline relation:** Commerce → Pricing → Payment Boundary → Billing Boundary → Future Billing Provider. Billing answers “what economic record exists?”
* **Separations:** Billing ≠ Payment. Billing ≠ Pricing. Billing ≠ Provider/Adapter. Opaque refs only — never live PDF payloads, tax engine outputs, or accounting sync sessions.
* **Kinds (foundation):** `billing.invoice`, `billing.receipt`, `billing.statement`, `billing.subscription`, `billing.membership`, `billing.operational`, `billing.business`.
* **Statuses (foundation):** `draft`, `pending`, `issued`, `paid`, `cancelled`, `refunded`, `archived`.
* **Contract shape:** Opaque `billingReference`, required `tenantReference`, `billingKind`, `billingStatus`; optional opaque `commerceReference`, `paymentReference`, `customerReference`, `actorReference`, `currencyReference`, `amountReference`, `taxReference`, `contextReference`, `parentBillingReference`, controlled `metadata`.
* **Tenant isolation:** Billing may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createBilling` / `resolveBilling` only. No generateInvoice, createPDF, sendInvoice, calculateTax, syncAccounting, connectFiscalProvider, or stripeInvoice.
* **Dependencies:** `@motanos/billing` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** fiscal provider adapters, PDF generation, tax calculation, accounting sync, delivery. No `@motanos/billing-lifecycle` in this phase.

**Rejected:** Absorbing Payment/Pricing into Billing; Billing → Stripe/PayPal/provider/invoice-PDF/tax/fiscal/accounting imports; implementing document generation, tax math, or ledger sync in this phase.

---

## DEC-NOTIFICATION-BOUNDARY-001 — Notification Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 102 (evolving Fase 74) consolidates Notification as a pure communication-existence boundary — “what communication exists?” — independently of how messages are transported, which external rail is used (email / WhatsApp / SMS / push), send templates, queues, retries, campaigns, and automations. Multi-channel MotanOS requires Notification to stay rail-agnostic so future delivery providers can plug in as adapters. No notification-lifecycle split was required: `@motanos/notification` was already a slim boundary. Distinct from legacy `@motanos/notifications` scaffolding.

**Decision:**

* **Ownership:** `Notification`, factories, and `NotificationPort` live in `@motanos/notification` (`packages/engines/notification`). Notification is an independent bounded context — not Content, Template, Workflow, Delivery Provider, or Runtime adapters.
* **Pipeline relation:** Domain Context → Notification Boundary → Future Delivery Providers. Notification answers “what communication exists?”
* **Separations:** Notification ≠ Delivery. Notification ≠ Template. Notification ≠ Content. Notification ≠ Workflow. Opaque refs only — never live message bodies, addresses, or vendor sessions.
* **Kinds (foundation):** `notification.communication`, `notification.system`, `notification.operational`, `notification.business`, `notification.event`, `notification.alert`.
* **Statuses (foundation):** `draft`, `pending`, `active`, `sent`, `failed`, `cancelled`, `archived`.
* **Contract shape:** Opaque `notificationReference`, required `tenantReference`, `notificationKind`, `notificationStatus`; optional opaque `actorReference`, `customerReference`, `memberReference`, `contextReference`, `contentReference`, `templateReference`, `channelReference`, `parentNotificationReference`, controlled `metadata`.
* **Tenant isolation:** Notification may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createNotification` / `resolveNotification` only. No sendNotification, deliverNotification, sendEmail, sendSMS, sendWhatsApp, pushNotification, createCampaign, scheduleDelivery, or retryDelivery.
* **Dependencies:** `@motanos/notification` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** delivery provider adapters, template rendering, queues, campaigns. No `@motanos/notification-lifecycle` in this phase.

**Rejected:** Turning Notification into a messaging/delivery product; Notification → email/SMS/WhatsApp/push/provider/queue/campaign imports; implementing real transport or campaign runners in this phase.

---

## DEC-AUDIT-BOUNDARY-001 — Audit Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 103 (evolving Fase 75) consolidates Audit as a pure auditable-event boundary — “what auditable action or event exists?” — independently of where it is stored, how it is persisted, technical logging, observability, SIEM, external compliance systems, analytics, reporting, alerts, fraud detection, and monitoring. MotanOS needs an opaque audit record so future Audit Storage / Compliance Providers can plug in as adapters. No audit-lifecycle split was required: `@motanos/audit` was already a slim boundary. Entity renamed to `AuditEntry`; port is `createAudit` / `resolveAudit`.

**Decision:**

* **Ownership:** `AuditEntry`, factories, and `AuditPort` live in `@motanos/audit` (`packages/engines/audit`). Audit is an independent bounded context — not Measurement, Analytics, Logging, Compliance, Reporting, or Runtime adapters.
* **Pipeline relation:** Actor / Domain Event → Audit Boundary → Future Audit Storage / Compliance Provider. Audit answers “what fact occurred?”
* **Separations:** Audit ≠ Logging. Audit ≠ Analytics. Audit ≠ Reporting. Audit ≠ Compliance. Opaque refs only — never live persistence sessions, log payloads, or report documents.
* **Kinds (foundation):** `audit.security`, `audit.access`, `audit.business`, `audit.operational`, `audit.system`, `audit.compliance`.
* **Statuses (foundation):** `draft`, `active`, `processed`, `archived`, `cancelled`.
* **Contract shape:** Opaque `auditReference`, required `tenantReference`, `auditKind`, `auditStatus`; optional opaque `actorReference`, `identityReference`, `membershipReference`, `permissionReference`, `entityReference`, `entityKind`, `actionReference`, `contextReference`, `parentAuditReference`, controlled `metadata`.
* **Tenant isolation:** Audit may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createAudit` / `resolveAudit` only. No writeLog, storeAudit, persistAudit, sendReport, generateComplianceReport, trackAnalytics, monitorActivity, detectFraud, or exportAudit.
* **Dependencies:** `@motanos/audit` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** storage adapters, compliance provider adapters, history query APIs. No `@motanos/audit-lifecycle` in this phase.

**Rejected:** Turning Audit into logging/analytics/reporting/compliance; Audit → database/logger/analytics/monitoring imports; implementing persistence or fraud detection in this phase.

---

## DEC-PERMISSIONS-BOUNDARY-001 — Permissions Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 101 consolidates Permissions as a pure declarative authorization boundary — “what action capacity exists for an actor within a context?” — independently of who the actor is (Identity), what they belong to (Membership), authentication/sessions, user-role administration, tenant management, action execution, workflows, and business policy engines. MotanOS needs a rail-agnostic capacity record so future RBAC/ABAC adapters can plug in without absorbing Identity or Membership. Historical AuthorizationService / RBAC motor moved to `@motanos/permissions-lifecycle`; `@motanos/permissions` is the pure boundary under `packages/engines/permissions`.

**Decision:**

* **Ownership:** `Permission`, factories, and `PermissionPort` live in `@motanos/permissions` (`packages/engines/permissions`). Permissions is an independent bounded context — not Identity, Membership, Auth, Policy, Workflow, or Runtime adapters.
* **Pipeline relation:** Identity → Membership → Permissions Boundary → Domain Engines. Permissions answers “what can they do?”
* **Separations:** Permissions ≠ Identity. Permissions ≠ Membership. Permissions ≠ Authentication. Permissions ≠ Policy. Permissions ≠ Workflow. Opaque refs only — never live person profiles, session tokens, or policy documents.
* **Kinds (foundation):** `permission.identity`, `permission.role`, `permission.resource`, `permission.operational`, `permission.business`, `permission.system`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `suspended`, `archived`, `cancelled`.
* **Contract shape:** Opaque `permissionReference`, required `tenantReference`, `permissionKind`, `permissionStatus`; optional opaque `identityReference`, `membershipReference`, `roleReference`, `resourceReference`, `actionReference`, `contextReference`, `parentPermissionReference`, controlled `metadata`.
* **Tenant isolation:** Permission may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createPermission` / `resolvePermission` only. No checkPermission, authorize, assignRole, createRole, grantAccess, revokeAccess, authenticate, createPolicy, or executeWorkflow.
* **Dependencies:** `@motanos/permissions` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** RBAC/ABAC evaluation adapters, Runtime wiring. Historical motor retained in `@motanos/permissions-lifecycle`.

**Rejected:** Absorbing Identity/Membership/Auth into Permissions; Permissions → Identity/Membership/Auth/Workflow/Policy imports; implementing check/authorize/grant/revoke in this phase.

---

## DEC-ANALYTICS-BOUNDARY-001 — Analytics Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 115 (evolving Fase 76) consolidates Analytics as a pure analytical-capacity boundary — “what analytical capacity exists?” — independently of Measurement value creation, Reporting presentation, Audit recording, dashboards, monitoring/observability, event processing, warehouses, pipelines, and technical analytical storage. MotanOS needs an opaque analytics record so future Analytics Runtimes can plug in without absorbing Measurement or Reporting. No analytics-lifecycle split was required: `@motanos/analytics` was already a slim boundary (evolved from AnalyticsEvent signal model to Analytics capacity model).

**Decision:**

* **Ownership:** `Analytics`, factories, and `AnalyticsPort` live in `@motanos/analytics` (`packages/engines/analytics`). Analytics is an independent bounded context — not Measurement, Reporting, Audit, Monitoring, or Event Processing.
* **Pipeline relation:** Measurement Boundary → Analytics Boundary → Future Analytics Runtime. Analytics answers “what analytical capacity exists?”
* **Separations:** Analytics ≠ Measurement. Analytics ≠ Reporting. Analytics ≠ Audit. Analytics represents analytical capacities, not interpretation execution or presentation. Opaque refs only — prepared for future analytical runtimes.
* **Kinds (foundation):** `analytics.business`, `analytics.operational`, `analytics.experience`, `analytics.domain`, `analytics.system`, `analytics.customer`, `analytics.performance`.
* **Statuses (foundation):** `draft`, `active`, `configured`, `archived`, `cancelled`.
* **Contract shape:** Opaque `analyticsReference`, required `analyticsKind`, `analyticsStatus`; optional opaque `contextReference`, `actorReference`, `entityReference`, `entityKind`, `measurementReference`, `eventReference`, `dimensionReference`, `parentAnalyticsReference`, controlled `metadata`.
* **Scope isolation:** Optional bound context may require an exact opaque context reference match.
* **Port surface:** `createAnalytics` / `resolveAnalytics` only. No calculateAnalytics, executeQuery, aggregateData, generateReport, createDashboard, processEvent, storeAnalytics, runPipeline, or monitorSystem.
* **Dependencies:** `@motanos/analytics` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Analytics Runtime adapters. No `@motanos/analytics-lifecycle` in this phase.

**Rejected:** Absorbing Measurement/Reporting/Audit/Monitoring into Analytics; Analytics → reporting/dashboard/monitoring/storage/pipeline/warehouse/runtime imports; implementing calculations, presentation, or technical observation in this phase.

---

## DEC-WORKFLOW-BOUNDARY-001 — Workflow Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 105 (evolving Fase 77) consolidates Workflow as a pure declarative-process boundary — “what process or flow exists?” — independently of step execution, automation, notification delivery, policy evaluation, permissions, task storage, jobs, queues, and external integrations. MotanOS needs an opaque workflow record so future Workflow Runtimes can plug in as adapters. No workflow-lifecycle split was required: `@motanos/workflow` was already a slim boundary.

**Decision:**

* **Ownership:** `Workflow`, factories, and `WorkflowPort` live in `@motanos/workflow` (`packages/engines/workflow`). Workflow is an independent bounded context — not Policy, Permissions, Notification, Audit, or Workflow Runtime.
* **Pipeline relation:** Context / Process Definition → Workflow Boundary → Future Workflow Runtime. Workflow answers “what process exists?”
* **Separations:** Workflow ≠ Runtime. Workflow ≠ Policy. Workflow ≠ Permissions. Workflow ≠ Notification. Opaque refs only — never live runner sessions, job payloads, or queue handles.
* **Kinds (foundation):** `workflow.business`, `workflow.operational`, `workflow.customer`, `workflow.internal`, `workflow.system`, `workflow.event`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `paused`, `completed`, `cancelled`, `archived`.
* **Contract shape:** Opaque `workflowReference`, required `tenantReference`, `workflowKind`, `workflowStatus`; optional opaque `actorReference`, `contextReference`, `entityReference`, `entityKind`, `triggerReference`, `stepReference`, `parentWorkflowReference`, controlled `metadata`.
* **Tenant isolation:** Workflow may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createWorkflow` / `resolveWorkflow` only. No executeWorkflow, runWorkflow, startWorkflow, completeTask, scheduleWorkflow, triggerAutomation, enqueueJob, or processStep.
* **Dependencies:** `@motanos/workflow` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** step graphs, runtime adapters, scheduling. No `@motanos/workflow-lifecycle` in this phase.

**Rejected:** Absorbing Runtime/Policy/Permissions/Notification into Workflow; Workflow → queue/job/automation/notification/policy imports; implementing step execution or scheduling in this phase.

---

## DEC-POLICY-BOUNDARY-001 — Policy Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 104 (evolving Fase 78) consolidates Policy as a pure declarative-condition boundary — “what condition or rule exists?” — independently of how it is evaluated or executed, who has permission, authentication, authorization, workflows, configuration, feature flags, billing plans, analytics, and decision engines. MotanOS needs an opaque policy record so future Policy Evaluation Engines can plug in as adapters. No policy-lifecycle split was required: `@motanos/policy` was already a slim boundary.

**Decision:**

* **Ownership:** `Policy`, factories, and `PolicyPort` live in `@motanos/policy` (`packages/engines/policy`). Policy is an independent bounded context — not Permissions, Workflow, Configuration, or Decision Engine.
* **Pipeline relation:** Context / Rule Definition → Policy Boundary → Future Policy Evaluation Engine. Policy answers “under what conditions does a constraint apply?”
* **Separations:** Policy ≠ Permissions. Policy ≠ Workflow. Policy ≠ Configuration. Policy ≠ Decision Engine. Opaque refs only — never live evaluation sessions, rule ASTs, or capacity catalogs.
* **Kinds (foundation):** `policy.access`, `policy.business`, `policy.operational`, `policy.security`, `policy.resource`, `policy.system`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `suspended`, `archived`, `cancelled`.
* **Contract shape:** Opaque `policyReference`, required `tenantReference`, `policyKind`, `policyStatus`; optional opaque `actorReference`, `membershipReference`, `permissionReference`, `contextReference`, `resourceReference`, `conditionReference`, `actionReference`, `parentPolicyReference`, controlled `metadata`.
* **Tenant isolation:** Policy may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createPolicy` / `resolvePolicy` only. No evaluatePolicy, executePolicy, checkRule, decide, authorize, createRule, runWorkflow, calculateDecision, or applyPolicy.
* **Dependencies:** `@motanos/policy` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** evaluation adapters, expression language, Runtime wiring. No `@motanos/policy-lifecycle` in this phase.

**Rejected:** Absorbing Permissions/Workflow/Configuration into Policy; Policy → Permissions/Auth/Workflow/Configuration/evaluation imports; implementing evaluation or rule execution in this phase.

---

## DEC-CONFIGURATION-BOUNDARY-001 — Configuration Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 106 (evolving Fase 79) consolidates Configuration as a pure declarative-settings boundary — “what configuration exists?” — independently of applying settings, resolving them at runtime, executing feature flags, managing secrets, deploying changes, syncing external providers, modifying system behaviour, evaluating rules, and running workflows. MotanOS needs an opaque configuration record so future Configuration Runtimes can plug in as adapters. No configuration-lifecycle split was required: `@motanos/configuration` was already a slim boundary. Distinct from shared `@motanos/config` tooling.

**Decision:**

* **Ownership:** `Configuration`, factories, and `ConfigurationPort` live in `@motanos/configuration` (`packages/engines/configuration`). Configuration is an independent bounded context — not Policy, Workflow, Runtime, Secrets, or Feature Runtime.
* **Pipeline relation:** Tenant / Domain Context → Configuration Boundary → Future Configuration Runtime. Configuration answers “what configuration exists?”
* **Separations:** Configuration ≠ Runtime. Configuration ≠ Policy. Configuration ≠ Workflow. Configuration ≠ Secrets. Opaque refs only — never live vault payloads, env files, or deploy sessions.
* **Kinds (foundation):** `configuration.system`, `configuration.tenant`, `configuration.business`, `configuration.operational`, `configuration.experience`, `configuration.feature`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `disabled`, `archived`, `cancelled`.
* **Contract shape:** Opaque `configurationReference`, required `tenantReference`, `configurationKind`, `configurationStatus`; optional opaque `contextReference`, `entityReference`, `entityKind`, `scopeReference`, `keyReference`, `valueReference`, `parentConfigurationReference`, controlled `metadata`.
* **Tenant isolation:** Configuration may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createConfiguration` / `resolveConfiguration` only. No applyConfiguration, resolveRuntimeConfiguration, executeFeatureFlag, syncConfiguration, deployConfiguration, loadSecret, updateEnvironment, or evaluateConfiguration.
* **Dependencies:** `@motanos/configuration` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** application adapters, hierarchical overrides. No `@motanos/configuration-lifecycle` in this phase.

**Rejected:** Absorbing Runtime/Policy/Workflow/Secrets into Configuration; Configuration → runtime/workflow/policy/permission/provider/secret imports; implementing application or deploy sync in this phase.

---

## DEC-TENANT-BOUNDARY-001 — Tenant Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 107 (evolving Fase 80) consolidates Tenant as a pure multi-tenant existence boundary — “what tenant exists?” — independently of infrastructure provisioning, user creation, permissions, billing, external service setup, onboarding execution, resource deployment, database administration, and subscriptions. MotanOS needs an opaque tenant root so Identity, Membership, Configuration, and Billing can reference it without absorbing platform operations. No tenant-lifecycle split was required: `@motanos/tenant` was already a slim boundary.

**Decision:**

* **Ownership:** `Tenant`, factories, and `TenantPort` live in `@motanos/tenant` (`packages/engines/tenant`). Tenant is an independent bounded context — not Identity, Membership, Billing, Configuration Runtime, or infrastructure.
* **Pipeline relation:** Platform Context → Tenant Boundary → Future Tenant Runtime. Tenant answers “what tenant exists?”
* **Separations:** Tenant ≠ Identity. Tenant ≠ Membership. Tenant ≠ Billing. Tenant ≠ Runtime. Opaque refs only — never live people, vaults, or provision sessions.
* **Kinds (foundation):** `tenant.organization`, `tenant.business`, `tenant.club`, `tenant.platform`, `tenant.internal`, `tenant.operational`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `suspended`, `archived`, `cancelled`.
* **Contract shape:** Opaque `tenantReference`, required `tenantKind`, `tenantStatus`; optional opaque `organizationReference`, `ownerReference`, `parentTenantReference`, `contextReference`, `regionReference`, `planReference`, `configurationReference`, controlled `metadata`.
* **Tenant isolation:** Empty `tenantReference` is denied; optional bound context may require an exact root reference match.
* **Port surface:** `createTenant` / `resolveTenant` only. No provisionTenant, createUser, assignMembership, createSubscription, configureTenantRuntime, deployTenant, migrateTenantDatabase, or activateBilling.
* **Dependencies:** `@motanos/tenant` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** hierarchy policies, provision adapters. No `@motanos/tenant-lifecycle` in this phase.

**Rejected:** Turning Tenant into User Management or Billing; Tenant → Identity/Membership/Billing/database/runtime imports; implementing people, subscriptions, or infrastructure inside Tenant in this phase.

---

## DEC-ASSET-BOUNDARY-001 — Asset Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 81 introduces the Asset Engine so MotanOS can express conceptual digital resources (images, documents, files), their business-context links, and lifecycle independently of physical storage, cloud providers, real URLs, Supabase Storage, AWS S3, multimedia processing, access permissions, and file uploads. Asset answers “what digital resource is associated with a context?” — not where it is kept or how it is served.

**Decision:**

* **Ownership:** `Asset`, factories, and `AssetPort` live in `@motanos/asset` (`packages/engines/asset`). Asset is an independent bounded context — not Tenant, Identity, Experience, Community, Commerce, Storage, Database, or Permissions.
* **Pipeline relation:** Domain Context → Asset Boundary → Storage Provider (future). Tenant / Experience / Community / Commerce / Identity may reference assets opaquely; Storage Provider owns where bytes live; Media Processing owns transforms; Authorization owns who may access.
* **Separations:** Asset ≠ Storage. Asset ≠ Media Processing. Asset ≠ Authorization. Asset ≠ File Upload. No buckets, public URLs, CDN, S3, Supabase Storage, thumbnails, permissions, or users in this foundation.
* **Kinds (foundation):** `asset.image`, `asset.document`, `asset.logo`, `asset.media`, `asset.avatar`, `asset.operational`.
* **Statuses (foundation):** `draft`, `active`, `processing`, `inactive`, `archived`, `cancelled` (e.g. draft → active → archived).
* **Contract shape:** Opaque `assetReference`, required `tenantReference`, `assetKind`, `assetStatus`; optional opaque `nameReference`, `descriptionReference`, `contextReference`, `ownerReference`, `parentAssetReference`, controlled `metadata`. No passwords, tokens, credentials, secrets, or API keys. Future opaque links to experience/community/commerce/identity — never engine imports.
* **Tenant isolation:** Asset may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createAsset` / `resolveAsset` only. No uploadAsset, downloadAsset, deleteFile, generateThumbnail, processMedia, or storeAsset methods in this foundation.
* **Runtime:** Composition root for future `Asset Port → Adapter`. No database, storage adapters, cloud providers, or upload handlers in this foundation.
* **Dependencies:** `@motanos/asset` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** storage adapters, media processing pipelines, delivery URLs, access policies.

**Rejected:** Turning Asset into File Storage; absorbing Media Processing or Authorization; Asset → S3/Supabase/CDN imports; Application → Storage Provider; implementing upload/download or transforms in this phase.

---

## DEC-SEARCH-BOUNDARY-001 — Search Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 117 (evolving Fase 82) consolidates Search as a pure discovery-capacity boundary — “what discovery capacity exists?” — independently of Catalog existence, Recommendation suggestions, Analytics interpretation, technical indexing, ranking, external search providers, vector/embedding systems, crawlers, and storage. MotanOS needs an opaque search record so future Search Runtimes can plug in without absorbing Catalog or Recommendation. No search-lifecycle split was required: `@motanos/search` was already a slim boundary (evolved from SearchEntry to Search capacity model).

**Decision:**

* **Ownership:** `Search`, factories, and `SearchPort` live in `@motanos/search` (`packages/engines/search`). Search is an independent bounded context — not Catalog, Recommendation, Analytics, or Runtime.
* **Pipeline relation:** Catalog Boundary → Search Boundary → Future Search Runtime. Search answers “what discovery capacity exists?”
* **Separations:** Search ≠ Catalog. Search ≠ Recommendation. Search ≠ Analytics. Search represents discovery capacity, not technical execution. Opaque refs only — prepared for future search runtimes.
* **Kinds (foundation):** `search.catalog`, `search.discovery`, `search.business`, `search.operational`, `search.experience`, `search.customer`, `search.internal`.
* **Statuses (foundation):** `draft`, `active`, `configured`, `available`, `archived`, `cancelled`.
* **Contract shape:** Opaque `searchReference`, required `searchKind`, `searchStatus`; optional opaque `contextReference`, `actorReference`, `entityReference`, `entityKind`, `catalogReference`, `queryReference`, `scopeReference`, `parentSearchReference`, controlled `metadata`.
* **Scope isolation:** Optional bound context may require an exact opaque context reference match.
* **Port surface:** `createSearch` / `resolveSearch` only. No executeSearch, indexContent, buildIndex, rankResults, generateEmbedding, connectProvider, searchDatabase, recommendItems, crawlContent, or storeIndex.
* **Dependencies:** `@motanos/search` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Search Runtime adapters. No `@motanos/search-lifecycle` in this phase.

**Rejected:** Absorbing Catalog/Recommendation/Analytics into Search; Search → index/ranking/query/provider/vector/embedding/recommendation/storage/crawler/runtime/database imports; implementing real find, rank, or crawl execution in this phase.

---

## DEC-RECOMMENDATION-BOUNDARY-001 — Recommendation Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 118 (evolving Fase 83) consolidates Recommendation as a pure suggestion-existence boundary — “what suggestion exists?” — independently of Search discovery capacity, Analytics interpretation, Measurement values, Event occurrence, technical ranking/scoring, machine learning, personalization runtimes, tracking, prediction, embeddings, vector systems, and external recommendation providers. MotanOS needs an opaque recommendation record so future Recommendation Runtimes can plug in without absorbing Search or Analytics. No recommendation-lifecycle split was required: `@motanos/recommendation` was already a slim boundary (evolved from tenant-scoped suggestion context to suggestion-existence capacity model).

**Decision:**

* **Ownership:** `Recommendation`, factories, and `RecommendationPort` live in `@motanos/recommendation` (`packages/engines/recommendation`). Recommendation is an independent bounded context — not Search, Analytics, Measurement, Event, or Runtime.
* **Pipeline relation:** Search Boundary → Recommendation Boundary → Future Recommendation Runtime. Recommendation answers “what suggestion exists?”
* **Separations:** Recommendation ≠ Search. Recommendation ≠ Analytics. Recommendation ≠ Personalization Runtime. Recommendation represents an existing suggestion, not technical execution. Opaque refs only — prepared for future recommendation runtimes.
* **Kinds (foundation):** `recommendation.catalog`, `recommendation.discovery`, `recommendation.business`, `recommendation.operational`, `recommendation.experience`, `recommendation.customer`, `recommendation.internal`.
* **Statuses (foundation):** `draft`, `active`, `configured`, `available`, `archived`, `cancelled`.
* **Contract shape:** Opaque `recommendationReference`, required `recommendationKind`, `recommendationStatus`; optional opaque `contextReference`, `actorReference`, `entityReference`, `entityKind`, `catalogReference`, `searchReference`, `sourceReference`, `parentRecommendationReference`, controlled `metadata`.
* **Scope isolation:** Optional bound context may require an exact opaque context reference match.
* **Port surface:** `createRecommendation` / `resolveRecommendation` only. No executeRecommendation, calculateRecommendation, rankRecommendations, generatePrediction, trainModel, personalizeUser, connectProvider, trackRecommendation, recommendItems, or runAlgorithm.
* **Dependencies:** `@motanos/recommendation` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Recommendation Runtime adapters. No `@motanos/recommendation-lifecycle` in this phase.

**Rejected:** Absorbing Search/Analytics/Measurement/Event into Recommendation; Recommendation → ranking/score/model/algorithm/personalization/tracking/prediction/provider/machine/learning/search/analytics/storage/runtime imports; implementing real suggest compute, rank, or personalize execution in this phase.

---

## DEC-FEATURE-BOUNDARY-001 — Feature Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 119 introduces Feature as a pure functional-capacity boundary — “what functional capacity exists?” — independently of Configuration existence, Feature Runtime activation, Experimentation trials, Rollout distribution, Deployment publication, feature-flag/toggle execution, targeting, evaluation rules, and external providers. MotanOS needs an opaque feature record so future Feature Runtimes can plug in without absorbing Configuration or Experimentation. No feature-lifecycle split was required: `@motanos/feature` is a new slim boundary.

**Decision:**

* **Ownership:** `Feature`, factories, and `FeaturePort` live in `@motanos/feature` (`packages/engines/feature`). Feature is an independent bounded context — not Configuration, Runtime, Experimentation, Rollout, or Deployment.
* **Pipeline relation:** Configuration Boundary → Feature Boundary → Future Feature Runtime. Feature answers “what functional capacity exists?”
* **Separations:** Feature ≠ Configuration. Feature ≠ Runtime. Feature ≠ Experimentation. Feature represents an existing functional capacity, not technical activation. Opaque refs only — prepared for future feature runtimes.
* **Kinds (foundation):** `feature.product`, `feature.business`, `feature.operational`, `feature.experience`, `feature.customer`, `feature.system`, `feature.internal`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `available`, `archived`, `cancelled`.
* **Contract shape:** Opaque `featureReference`, required `featureKind`, `featureStatus`; optional opaque `contextReference`, `actorReference`, `entityReference`, `entityKind`, `configurationReference`, `capabilityReference`, `parentFeatureReference`, controlled `metadata`.
* **Scope isolation:** Optional bound context may require an exact opaque context reference match.
* **Port surface:** `createFeature` / `resolveFeature` only. No enableFeature, disableFeature, evaluateFeature, executeToggle, assignVariant, rolloutFeature, targetUsers, runExperiment, deployFeature, or connectProvider.
* **Dependencies:** `@motanos/feature` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Feature Runtime adapters. No `@motanos/feature-lifecycle` in this phase.

**Rejected:** Absorbing Configuration/Runtime/Experimentation/Rollout/Deployment into Feature; Feature → flag/toggle/rollout/experiment/variant/target/evaluation/deployment/provider/runtime/configuration/workflow/policy imports; implementing real activation, toggle, or trial execution in this phase.

---

## DEC-LOCALIZATION-BOUNDARY-001 — Localization Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 84 introduces the Localization Engine so MotanOS can manage linguistic and regional adaptation as a global SaaS platform — product UI copy, tenant content copy, and operational tool copy — independently of frontend i18n libraries, automatic translation, Google Translate, DeepL, AI, business content bodies, and monetary formatting.

**Decision:**

* **Ownership:** `Localization`, factories, and `LocalizationPort` live in `@motanos/localization` (`packages/engines/localization`). Localization is an independent bounded context — not Tenant, Asset, Experience, Commerce, UI frameworks, or Translation Providers.
* **Pipeline relation:** Business Content / UI Content / System Content → Localization Boundary → Future Translation Provider. Three layers: Product Localization (MotanOS admin/surfaces), Tenant Content Localization (client-authored copy), Operational Localization (internal tools such as Smart Table / Food Cost).
* **Separations:** Localization ≠ automatic translation. Localization ≠ AI. Localization ≠ Google Translate / DeepL. Localization ≠ frontend i18n. Localization ≠ React components. Localization ≠ business content bodies. Localization ≠ monetary formats.
* **Kinds (foundation):** `localization.ui`, `localization.business`, `localization.operational`, `localization.content`, `localization.system`, `localization.document`.
* **Statuses (foundation):** `draft`, `active`, `pending`, `translated`, `archived`, `cancelled` (e.g. draft → active → pending → translated → archived).
* **Contract shape:** Opaque `localizationReference`, required `tenantReference`, `localizationKind`, `localizationStatus`; optional opaque `localeReference`, `sourceReference`, `targetReference`, `contextReference`, `ownerReference`, controlled `metadata`. No passwords, tokens, credentials, or secrets. Future opaque links to tenant/asset/experience/commerce/UI context — never engine imports.
* **Tenant isolation:** Localization may be bound to a tenant; cross-tenant creation is denied. Supports multi-tenant SaaS locale mixes (e.g. Admin ES + Customer EN).
* **Port surface:** `createLocalization` / `resolveLocalization` only. No translate, autoTranslate, detectLanguage, machineTranslate, or generateTranslation methods in this foundation.
* **Runtime:** Composition root for future `Localization Port → Adapter`. No database, AI clients, or translation SDKs in this foundation.
* **Dependencies:** `@motanos/localization` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** translation provider adapters, locale catalogs, copy resolution runtime, frontend i18n bridges.

**Rejected:** Turning Localization into an i18n library or auto-translate product; Localization → Google/DeepL/AI/database imports; Application → Translation Provider; implementing real translation or language detection in this phase.

---

## DEC-CURRENCY-BOUNDARY-001 — Currency Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 85 introduces the Currency Engine so MotanOS can represent monetary units, monetary context, and regional money references independently of payment, commerce pricing, billing, tax, exchange providers, banks, and Stripe. Currency answers “what currency and monetary context applies?” — not how money is charged, converted, or invoiced.

**Decision:**

* **Ownership:** `Currency`, factories, and `CurrencyPort` live in `@motanos/currency` (`packages/engines/currency`). Currency is an independent bounded context — not Payment, Commerce, Billing, Tax, Exchange Providers, or regional configuration engines.
* **Pipeline relation:** Tenant / Commerce Context → Currency Boundary → Future Exchange / Billing / Payment Providers. Commerce owns what is sold; Currency owns in which money unit it is expressed; Payment owns how payment is attempted; Billing owns fiscal recording.
* **Separations:** Currency ≠ Payment. Currency ≠ Exchange Rate. Currency ≠ Billing. Currency ≠ Tax. Currency ≠ Bank Provider. Currency ≠ Stripe. No EUR/USD conversion, prices, payments, taxes, invoices, or banks in this foundation.
* **Kinds (foundation):** `currency.primary`, `currency.supported`, `currency.operational`, `currency.display`, `currency.settlement`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `archived`, `cancelled` (e.g. draft → active → inactive → archived).
* **Contract shape:** Opaque `currencyReference`, required `tenantReference`, `currencyKind`, `currencyStatus`; optional opaque `codeReference`, `symbolReference`, `localeReference`, `regionReference`, `nameReference`, controlled `metadata`. No passwords, tokens, credentials, or secrets. Future opaque links to tenant/commerce/payment/billing — never engine imports.
* **Tenant isolation:** Currency may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createCurrency` / `resolveCurrency` only. No convertCurrency, calculateExchange, updateRate, fetchRates, or syncBank methods in this foundation.
* **Runtime:** Composition root for future `Currency Port → Adapter`. No database, FX APIs, or payment SDKs in this foundation.
* **Dependencies:** `@motanos/currency` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** exchange adapters, settlement policies, display formatting bridges, multi-currency catalogs.

**Rejected:** Absorbing Payment/Billing/Tax into Currency; Currency → Stripe/bank/exchange/database imports; Application → Exchange Provider; implementing conversion or rate sync in this phase.

---

## DEC-MEASUREMENT-BOUNDARY-001 — Measurement Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-04

**Context:** Fase 114 (evolving Fase 86) consolidates Measurement as a pure measurable-value boundary — “what measurable value exists?” — independently of Analytics interpretation, Reporting presentation, Audit recording, dashboards, monitoring/observability, event processing, aggregation engines, and technical metric storage. MotanOS needs an opaque measurement record so future Analytics / Reporting Runtimes can plug in without absorbing Audit or Event Processing. No measurement-lifecycle split was required: `@motanos/measurement` was already a slim boundary.

**Decision:**

* **Ownership:** `Measurement`, factories, and `MeasurementPort` live in `@motanos/measurement` (`packages/engines/measurement`). Measurement is an independent bounded context — not Analytics, Reporting, Audit, Monitoring, or Event Processing.
* **Pipeline relation:** Event Boundary → Measurement Boundary → Future Analytics / Reporting Runtime. Measurement answers “what measurable value exists?”
* **Separations:** Measurement ≠ Analytics. Measurement ≠ Reporting. Measurement ≠ Audit. Measurement represents an observable value, not interpretation or presentation. Opaque refs only — prepared for future analytical systems.
* **Kinds (foundation):** `measurement.value`, `measurement.performance`, `measurement.business`, `measurement.operational`, `measurement.experience`, `measurement.system`, `measurement.domain`.
* **Statuses (foundation):** `draft`, `active`, `recorded`, `archived`, `cancelled`.
* **Contract shape:** Opaque `measurementReference`, required `measurementKind`, `measurementStatus`; optional opaque `contextReference`, `actorReference`, `entityReference`, `entityKind`, `eventReference`, `valueReference`, `unitReference`, `parentMeasurementReference`, controlled `metadata`.
* **Scope isolation:** Optional bound context may require an exact opaque context reference match.
* **Port surface:** `createMeasurement` / `resolveMeasurement` only. No calculateMeasurement, aggregateMeasurement, analyzeMeasurement, generateReport, createDashboard, monitorMetric, trackMetric, publishMetric, or processEvent.
* **Dependencies:** `@motanos/measurement` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Analytics / Reporting Runtime adapters. No `@motanos/measurement-lifecycle` in this phase.

**Rejected:** Absorbing Analytics/Reporting/Audit/Monitoring into Measurement; Measurement → analytics/report/dashboard/monitoring/tracking/storage/runtime imports; implementing calculations, aggregations, visualizations, or technical observation in this phase.

---

## DEC-PREFERENCE-BOUNDARY-001 — Preference Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 87 introduces the Preference Engine so MotanOS can represent declarative preferences for a given context — independently of recommendations, automatic personalization, behavior learning, preference inference, user tracking, analytics, and AI. Preference answers “what preferences exist for a given context?” — not what to suggest, learn, or predict.

**Decision:**

* **Ownership:** `Preference`, factories, and `PreferencePort` live in `@motanos/preference` (`packages/engines/preference`). Preference is an independent bounded context — not Identity, Membership, Recommendation, Analytics, Configuration, AI providers, or Database providers.
* **Pipeline relation:** Actor / Tenant / Context → Preference Boundary → Future Experience / Recommendation / Personalization. Identity owns who the actor is; Membership owns relations; Preference owns declared preferences; Recommendation owns suggestions; Analytics owns what occurs and can be measured.
* **Separations:** Preference declares and resolves existing preferences only. Preference does not learn, infer, calculate, recommend, personalize, predict, track behavior, analyze, or generate preferences. Opaque references only (`actorReference`, `contextReference`, `valueReference`, …) — never `userId` / `customerId` / `memberId` / `profileId` / `databaseId`.
* **Kinds (foundation):** `preference.user`, `preference.tenant`, `preference.operational`, `preference.experience`, `preference.communication`, `preference.business`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `archived`, `cancelled` (e.g. draft → active → inactive → archived).
* **Contract shape:** Opaque `preferenceReference`, required `tenantReference`, `preferenceKind`, `preferenceStatus`; optional opaque `actorReference`, `contextReference`, `categoryReference`, `valueReference`, `sourceReference`, controlled `metadata`.
* **Tenant isolation:** Preference may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createPreference` / `resolvePreference` only. No learnPreference, inferPreference, calculatePreference, recommend, personalize, predict, trackBehavior, analyze, or generatePreference methods in this foundation.
* **Runtime:** Composition root for future `Preference Port → Adapter`. No database, AI clients, or cross-engine imports in this foundation.
* **Dependencies:** `@motanos/preference` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** preference resolution policies, experience/recommendation handoff, communication-channel catalogs.

**Rejected:** Turning Preference into CRM, full profiles, tracking, analytics, AI, or a recommendation engine; Preference → Identity/Membership/Recommendation/Analytics/OpenAI/database imports; implementing learning or inference in this phase.

---

## DEC-TEMPLATE-BOUNDARY-001 — Template Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 89 introduces the Template Engine so MotanOS can represent reusable structures for experiences, content, or operations — independently of CMS, visual editors, frontend pages, HTML renderers, design systems, automation engines, executable workflows, concrete experiences, and final generated content. Template answers “what reusable structure exists for a given context?” — not how to render, publish, send, or execute.

**Decision:**

* **Ownership:** `Template`, factories, and `TemplatePort` live in `@motanos/template` (`packages/engines/template`). Template is an independent bounded context — not Experience, Workflow, Notification, Localization, Asset, Recommendation, Analytics, Identity, Membership, AI providers, or Database providers.
* **Pipeline relation:** Business / Tenant Context → Template Boundary → Future Experience / Content / Operational Systems. Template defines existence, context, kind, and status only.
* **Separations:** Template ≠ Experience. Template ≠ Asset. Template ≠ Localization. Template ≠ Workflow. Template ≠ Notification. Template ≠ CMS / page builder / design system / automation. Opaque refs only — never `experienceId`, `bookingId`, `userId`, `workflowId`, `databaseId`.
* **Kinds (foundation):** `template.experience`, `template.content`, `template.operational`, `template.communication`, `template.business`, `template.system`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `archived`, `cancelled` (e.g. draft → active → inactive → archived).
* **Contract shape:** Opaque `templateReference`, required `tenantReference`, `templateKind`, `templateStatus`; optional opaque `nameReference`, `descriptionReference`, `contextReference`, `ownerReference`, `parentTemplateReference`, `assetReference`, controlled `metadata`.
* **Tenant isolation:** Template may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createTemplate` / `resolveTemplate` only. No renderTemplate, publishTemplate, deployTemplate, executeTemplate, generateTemplate, compileTemplate, sendTemplate, or translateTemplate in this foundation.
* **Runtime:** Composition root for future `Template Port → Adapter`. No process runners, AI clients, or cross-engine imports in this foundation.
* **Dependencies:** `@motanos/template` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Template Runtime, Experience/Content handoff, Localization linkage, Notification channel catalogs.

**Rejected:** Turning Template into CMS, page builder, frontend framework, workflow engine, AI engine, or automation; Template → Experience/Workflow/Notification/Localization/Asset/Recommendation/Analytics/Identity/Membership/OpenAI/database imports; implementing render, publish, send, or generation in this phase.

---

## DEC-CONTENT-BOUNDARY-001 — Content Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 90 introduces the Content Engine so MotanOS can represent reusable business information within a context — independently of CMS, rich-text editors, blog engines, publishing systems, file storage, automatic translation, frontend rendering, multimedia management, and AI generation. Content answers “what business information exists within a context?” — not how to publish, translate, render, or generate.

**Decision:**

* **Ownership:** `Content`, factories, and `ContentPort` live in `@motanos/content` (`packages/engines/content`). Content is an independent bounded context — not Template, Asset, Localization, Experience, Workflow, Notification, Recommendation, Analytics, Identity, Membership, AI providers, or Database providers.
* **Pipeline relation:** Business / Tenant Context → Content Boundary → Future Experience / Template / Localization Systems. Content defines existence, context, kind, and status only.
* **Separations:** Content ≠ Template. Content ≠ Asset. Content ≠ Localization. Content ≠ Experience. Content ≠ Notification. Content ≠ CMS / blog / page builder / multimedia store. Opaque refs only — never `experienceId`, `userId`, `bookingId`, `fileId`, `databaseId`, `translationId`.
* **Kinds (foundation):** `content.business`, `content.product`, `content.operational`, `content.communication`, `content.help`, `content.system`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `archived`, `cancelled` (e.g. draft → active → inactive → archived).
* **Contract shape:** Opaque `contentReference`, required `tenantReference`, `contentKind`, `contentStatus`; optional opaque `titleReference`, `descriptionReference`, `bodyReference`, `contextReference`, `ownerReference`, `templateReference`, `assetReference`, controlled `metadata`.
* **Tenant isolation:** Content may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createContent` / `resolveContent` only. No publishContent, renderContent, translateContent, generateContent, editContent, searchContent, syncContent, or uploadContent in this foundation.
* **Runtime:** Composition root for future `Content Port → Adapter`. No process runners, AI clients, or cross-engine imports in this foundation.
* **Dependencies:** `@motanos/content` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Content Runtime, Template/Experience handoff, Localization linkage, Asset binary storage.

**Rejected:** Turning Content into CMS, blog engine, visual editor, page builder, AI engine, publishing system, or multimedia storage; Content → Template/Asset/Localization/Experience/Workflow/Notification/Recommendation/Analytics/Identity/Membership/OpenAI/database imports; implementing publish, translate, render, upload, or generation in this phase.

---

## DEC-CATALOG-BOUNDARY-001 — Catalog Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 91 introduces the Catalog Engine so MotanOS can represent discoverable catalogable elements within a business context — independently of commerce, pricing, payments, bookings, inventory/stock, orders, billing, full content bodies, CMS, search, recommendation, and frontend rendering. Catalog answers “what elements exist and can be discovered within a business context?” — not how to sell, charge, reserve, search, or recommend.

**Decision:**

* **Ownership:** `CatalogItem`, factories, and `CatalogPort` live in `@motanos/catalog` (`packages/engines/catalog`). Catalog is an independent bounded context — not Commerce, Payment, Booking, Content, Asset, Template, Experience, Search, Recommendation, Analytics, Identity, Membership, AI providers, or Database providers.
* **Pipeline relation:** Tenant / Business Context → Catalog Boundary → Future Commerce / Booking / Experience Systems. Catalog defines existence, tenant, kind, and status only.
* **Separations:** Catalog ≠ Content. Catalog ≠ Asset. Catalog ≠ Template. Catalog ≠ Experience. Catalog ≠ Commerce. Catalog ≠ Payment. Catalog ≠ Booking. Catalog ≠ Search / Recommendation / Inventory. Opaque refs only — never `productId`, `bookingId`, `paymentId`, `priceId`, `inventoryId`, `databaseId`.
* **Kinds (foundation):** `catalog.product`, `catalog.service`, `catalog.activity`, `catalog.experience`, `catalog.resource`, `catalog.operational`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `archived`, `cancelled` (e.g. draft → active → inactive → archived).
* **Contract shape:** Opaque `catalogReference`, required `tenantReference`, `catalogKind`, `catalogStatus`; optional opaque `nameReference`, `descriptionReference`, `contextReference`, `categoryReference`, `assetReference`, `contentReference`, `templateReference`, controlled `metadata`.
* **Tenant isolation:** CatalogItem may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createCatalogItem` / `resolveCatalogItem` only. No sellCatalogItem, priceCatalogItem, checkoutCatalogItem, reserveCatalogItem, searchCatalogItem, recommendCatalogItem, publishCatalogItem, or updateInventory in this foundation.
* **Runtime:** Composition root for future `Catalog Port → Adapter`. No process runners, AI clients, or cross-engine imports in this foundation.
* **Dependencies:** `@motanos/catalog` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Catalog Runtime, Commerce/Booking handoff, Search indexing, Recommendation linkage.

**Rejected:** Turning Catalog into CMS, Commerce, Payment, Booking, Inventory, Search, Recommendation, or frontend builder; Catalog → Commerce/Payment/Booking/Content/Asset/Template/Experience/Search/Recommendation/Analytics/Identity/Membership/OpenAI/database imports; implementing sell, price, checkout, reserve, search, or recommend in this phase.

---

## DEC-PRICING-BOUNDARY-001 — Pricing Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 92 introduces the Pricing Engine so MotanOS can represent economic values and price definitions applicable to a business context or element — independently of charging, payment, checkout, invoicing, taxes, automatic discounts, payment providers, currency-as-financial-system, commerce, bookings, and inventory. Pricing answers “what economic value applies to a context or business element?” — not how to charge, invoice, or process payments.

**Decision:**

* **Ownership:** `Pricing`, factories, and `PricingPort` live in `@motanos/pricing` (`packages/engines/pricing`). Pricing is an independent bounded context — not Catalog, Commerce, Payment, Currency, Billing, Booking, Content, Asset, Template, Experience, Analytics, Identity, Membership, AI providers, or Database providers.
* **Pipeline relation:** Business Context / Catalog Context → Pricing Boundary → Future Commerce / Billing / Payment Systems. Pricing defines existence, tenant/context, kind, and status only.
* **Separations:** Pricing ≠ Catalog. Pricing ≠ Currency. Pricing ≠ Commerce. Pricing ≠ Payment. Pricing ≠ Billing. Pricing ≠ tax/discount/checkout engines. Opaque refs only — never `priceId`, `paymentId`, `stripePriceId`, `invoiceId`, `databaseId`.
* **Kinds (foundation):** `pricing.product`, `pricing.service`, `pricing.subscription`, `pricing.membership`, `pricing.booking`, `pricing.operational`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `archived`, `cancelled` (e.g. draft → active → inactive → archived).
* **Contract shape:** Opaque `pricingReference`, required `tenantReference`, `pricingKind`, `pricingStatus`; optional opaque `catalogReference`, `contextReference`, `amountReference`, `currencyReference`, `nameReference`, `descriptionReference`, `parentPricingReference`, controlled `metadata`.
* **Tenant isolation:** Pricing may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createPricing` / `resolvePricing` only. No charge, checkout, calculateTax, applyDiscount, convertCurrency, createInvoice, processPayment, syncStripe, or syncPayPal in this foundation.
* **Runtime:** Composition root for future `Pricing Port → Adapter`. No process runners, AI clients, payment SDKs, or cross-engine imports in this foundation.
* **Dependencies:** `@motanos/pricing` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Pricing Runtime, Commerce/Billing handoff, Currency conversion policies, provider sync.

**Rejected:** Turning Pricing into Payment, Billing, Commerce, Tax, Discount, or Checkout engines; Stripe/PayPal integrations; Pricing → Catalog/Commerce/Payment/Currency/Billing/Booking/Content/Asset/Template/Experience/Analytics/Identity/Membership/OpenAI/database imports; implementing charge, invoice, tax, discount, or currency conversion in this phase.

---

## DEC-BOOKING-BOUNDARY-001 — Booking Engine Boundary Split Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-03

**Context:** Fase 95 splits the historical `@motanos/booking` fat engine so MotanOS can keep a pure Booking Boundary (“what reservation exists within a business context?”) independently of availability, resources, calendars, pricing, payments, invoicing, notifications, and physical assignment. Mixing domain existence with lifecycle/operations blocked a clean bounded context and failed architectural separation scans.

**Decision:**

* **Split:**
  * `@motanos/booking` — Booking Boundary (existence, kind, status, opaque refs only).
  * `@motanos/booking-lifecycle` — provisional motor holding the prior services, queries, repositories, and operational sub-boundaries (payment/pricing/availability/resource/invoice intents, etc.).
* **Ownership (Boundary):** `Booking`, `createBooking`, `resolveBooking`, and `BookingPort` live in `@motanos/booking` (`packages/engines/booking/src/bookings/`).
* **Pipeline relation:** Catalog → Resource → Availability → Booking Boundary → Commerce / Pricing / Payment. Lifecycle remains a temporary compatibility layer for Application/Runtime.
* **Separations:** Booking ≠ Availability. Booking ≠ Resource. Booking ≠ Calendar. Booking ≠ Pricing. Booking ≠ Payment. Booking ≠ Billing/Invoice. Opaque refs only — never live foreign aggregates or provider IDs.
* **Kinds (foundation):** `booking.resource`, `booking.service`, `booking.experience`, `booking.event`, `booking.operational`, `booking.business`.
* **Statuses (foundation):** `draft`, `pending`, `confirmed`, `cancelled`, `completed`, `archived`.
* **Contract shape:** Opaque `bookingReference`, required `tenantReference`, `bookingKind`, `bookingStatus`; optional opaque `resourceReference`, `availabilityReference`, `catalogReference`, `actorReference`, `experienceReference`, `contextReference`, `parentBookingReference`, controlled `metadata`.
* **Port surface (Boundary):** `createBooking` / `resolveBooking` only. No reserve, book, confirmPayment, calculatePrice, checkAvailability, assignResource, createInvoice, or sendNotification.
* **Dependencies (Boundary):** `@motanos/booking` limited to `@motanos/contracts` + `@motanos/core`.
* **Consumers:** Application/Runtime/Domains that need the historical motor import `@motanos/booking-lifecycle`. Prior DEC-BOOKING-* operational records remain applicable to the lifecycle package until migrated into specialized engines.
* **Future direction:** progressive migration of lifecycle capabilities into specialized engines; shrink lifecycle over time.

**Rejected:** Keeping payment/pricing/availability/resource/invoice logic inside the Booking Boundary; Boundary → Payment/Pricing/Availability/Resource/Calendar/Commerce/Billing/OpenAI/database imports; deleting lifecycle behavior in this phase.

---
