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

**Date:** 2026-08-02

**Context:** Fase 65 introduces the Resource Engine so MotanOS can define usable/reservable capacity independently of Booking. Resource = usable capacity; Booking = usage intent. Per DEC-BOOKING-FREEZE-001, physical resource ownership must not live inside `@motanos/booking`. Booking only consumes opaque `resourceReference`.

**Decision:**

* **Ownership:** `Resource`, factories, and `ResourcePort` live in `@motanos/resource` (`packages/engines/resource`). Resource Engine is independent of Booking, Availability, Experience, Payment, and Runtime adapters.
* **Pipeline relation:** Resource Definition → Resource Availability (future) → Booking Intent → Booking Lifecycle. Resource answers “what usable capacity exists?”
* **Separations:** Resource ≠ Availability (free/busy). Resource ≠ Booking (who wants to use it). Resource ≠ Experience (product/offering). Resource ≠ Payment. Resource Engine ≠ Booking Resource Boundary (Booking-side opaque context/policy only).
* **Kinds (foundation):** `resource.facility`, `resource.table`, `resource.court`, `resource.course`, `resource.room`, `resource.space`, `resource.equipment`, `resource.operational`.
* **Statuses (foundation):** `draft`, `active`, `inactive`, `maintenance`, `archived` (e.g. draft → active ↔ maintenance, or active → archived).
* **Contract shape:** Opaque `resourceReference`, required `tenantReference`, `resourceKind`, `resourceStatus`; optional opaque `nameReference`, `descriptionReference`, `parentResourceReference`, `ownerReference`, controlled `metadata`. No PII, payment data, or credentials.
* **Tenant isolation:** Resource may be bound to a tenant; cross-tenant creation is denied.
* **Booking integration:** Booking consumes `resourceReference` only — never a full Resource object graph.
* **Runtime:** Composition root for future `Resource Port → Adapter` (`createResource` / `resolveResource`). No CRUD store, availability engine, booking creation, or vendor SDKs in this foundation.
* **Dependencies:** `@motanos/resource` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** hierarchy queries, inventory sync, availability linkage, Booking Runtime wiring.

**Rejected:** Embedding Resource Engine inside Booking; Resource → Booking/Availability/Payment imports; Application → Resource Provider; implementing availability slots, reservations, or persistence adapters in this phase.

---

## DEC-EXPERIENCE-BOUNDARY-001 — Experience Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 66 introduces the Experience Boundary so MotanOS can define what a business offers to a community, independently of Booking, Resource, Calendar events, Community, and Payment. Experience = what is offered; Resource = what exists; Booking = who wants to participate. Experience must not become an Event Engine yet, and must not absorb Community.

**Decision:**

* **Ownership:** Boundary `Experience`, factories, and `ExperiencePort` live in `@motanos/experience` (`packages/engines/experience/src/experiences/`). Experience Engine remains independent of Booking, Resource, Community, Commerce, Calendar, and Runtime adapters.
* **Pipeline relation:** Experience Definition → Resource Association → Booking Intent → Participation → Commerce. Experience answers “what offering exists for the community?”
* **Separations:** Experience ≠ Resource. Experience ≠ Booking. Experience ≠ Calendar Event (when it occurs). Experience ≠ Community. Experience ≠ Payment. Do not create Event Engine in this phase.
* **Kinds (foundation):** `experience.event`, `experience.activity`, `experience.tournament`, `experience.class`, `experience.service`, `experience.social`, `experience.operational`.
* **Statuses (foundation):** `draft`, `active`, `paused`, `completed`, `cancelled`, `archived` (e.g. draft → active → completed, or active ↔ paused).
* **Contract shape:** Opaque `experienceReference`, required `tenantReference`, `experienceKind`, `experienceStatus`; optional opaque `nameReference`, `descriptionReference`, `resourceReference`, `parentExperienceReference`, `ownerReference`, controlled `metadata`. No real users, PII, or payment data.
* **Tenant isolation:** Experience may be bound to a tenant; cross-tenant creation is denied.
* **Export surface:** Package-root `Experience` / `CreateExperienceInput` / `EXPERIENCE_STATUSES` / `isExperienceStatus` are the Boundary. Legacy domain aggregate shapes are re-exported as `ExperienceAggregate`, `CreateExperienceAggregateInput`, `EXPERIENCE_AGGREGATE_STATUSES`, `isExperienceAggregateStatus` (DEC-EXPERIENCE-001..003 remain for legacy layer types).
* **Future refs:** May later hold opaque `resourceReference`, booking participation refs, and `communityReference` — never full foreign aggregates.
* **Runtime:** Composition root for future `Experience Port → Adapter` (`createExperience` / `resolveExperience`). No publish/calendar, booking creation, resource assignment, charging, or vendor SDKs in this foundation.
* **Dependencies:** `@motanos/experience` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Event Engine, Community linkage, Booking Runtime wiring, Resource assignment flows, Journey/Capability evolution beyond existing provisional types.

**Rejected:** Turning Experience into Event/Calendar Engine; absorbing Community; Experience → Booking/Resource/Payment imports; Application → Experience Provider; implementing publish, reservations, resource assignment, or charge flows in this phase.

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

## DEC-IDENTITY-BOUNDARY-001 — Identity Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 68 introduces the Identity Engine so MotanOS can represent a conceptual identity reference independently of authentication, profiles, membership, community, booking, and permissions. Identity = who the entity is; Authentication = how they prove it; Authorization = what they may do; Profile = additional descriptive data. Do not create an Auth Engine or a User model in this phase.

**Decision:**

* **Ownership:** `Identity`, factories, and `IdentityPort` live in `@motanos/identity` (`packages/engines/identity`). Identity is an independent bounded context — not Auth, Community, Membership, Booking, Experience, Resource, Commerce, or Runtime adapters.
* **Pipeline relation:** Identity Definition → Authentication Provider (future) → Profile (future) → Community / Membership / Booking. Identity answers “does an entity exist in the ecosystem?”
* **Separations:** Identity ≠ Authentication (no secrets or credential material). Identity ≠ User model (User mixes too many concerns). Identity ≠ Profile. Identity ≠ Membership. Identity ≠ Community. Identity ≠ Booking. Identity ≠ Authorization/permissions.
* **Kinds (foundation):** `identity.person`, `identity.organization`, `identity.service`, `identity.system`, `identity.operational`.
* **Statuses (foundation):** `draft`, `active`, `suspended`, `archived`, `cancelled` (e.g. draft → active ↔ suspended → archived).
* **Contract shape:** Opaque `identityReference`, required `tenantReference`, `identityKind`, `identityStatus`; optional opaque `externalReference`, `ownerReference`, controlled `metadata`. No secret material, credential fields, or PII payloads.
* **Tenant isolation:** Identity may be bound to a tenant; cross-tenant creation is denied.
* **Future refs:** Other engines consume opaque `identityReference` / `actorReference` — never a full Identity object graph with auth or profile data.
* **Port surface:** `createIdentity` / `resolveIdentity` only. No sign-in, registration, contact verification, or role assignment methods in this foundation.
* **Runtime:** Composition root for future `Identity Port → Adapter`. No external identity providers, session material, or persistence vendors in this foundation.
* **Dependencies:** `@motanos/identity` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** Auth Engine, Profile Engine, provider wiring, Membership/Community Runtime linkage.

**Rejected:** Creating Auth Engine or User model inside Identity; embedding secrets/credentials; Identity → Auth/Community/Membership/Booking imports; Application → Identity Provider; implementing sign-in, registration, or external provider adapters in this phase.

---

## DEC-MEMBERSHIP-BOUNDARY-001 — Membership Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 69 introduces the Membership Engine so MotanOS can express the relation between an identity and an organization/club/business, independently of Identity (who you are), commercial plans/charging, Authorization (what you may do), Community, Experience, and Booking. Membership must not become Billing or RBAC. Distinct from the Booking Membership Boundary (opaque context inside `@motanos/booking`).

**Decision:**

* **Ownership:** `Membership`, factories, and `MembershipPort` live in `@motanos/membership` (`packages/engines/membership`). Membership is an independent bounded context — not Identity, Community, Experience, Booking, Commerce, Auth, or Runtime adapters.
* **Pipeline relation:** Identity → Membership Relation → Organization / Tenant → Community / Experience / Benefits. Membership answers “what relation does this identity have with the organization?”
* **Separations:** Membership ≠ Identity (holds opaque `identityReference` only). Membership ≠ commercial charging / plans (related but distinct). Membership ≠ Authorization/RBAC. Membership ≠ Community (“you’re a member” vs “you’re in the group”). Membership Engine ≠ Booking Membership Boundary.
* **Kinds (foundation):** `membership.member`, `membership.player`, `membership.partner`, `membership.staff`, `membership.vip`, `membership.operational`.
* **Statuses (foundation):** `draft`, `active`, `paused`, `expired`, `cancelled` (e.g. draft → active → expired, or active ↔ paused).
* **Contract shape:** Opaque `membershipReference`, required `tenantReference`, required `identityReference`, `membershipKind`, `membershipStatus`; optional opaque `organizationReference`, `startReference`, `endReference`, controlled `metadata`. No secrets, credential material, or commerce charge fields.
* **Tenant isolation:** Membership may be bound to a tenant; cross-tenant creation is denied.
* **Future refs:** May later hold opaque `communityReference`, `experienceReference`, plan refs — never full foreign aggregates.
* **Port surface:** `createMembership` / `resolveMembership` only. No charge, plan-creation, or permission-assignment methods in this foundation.
* **Runtime:** Composition root for future `Membership Port → Adapter`. No vendor SDKs or persistence adapters in this foundation.
* **Dependencies:** `@motanos/membership` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** plan catalogs, commercial charging linkage, benefit catalogs, Community/Identity Runtime wiring.

**Rejected:** Turning Membership into Billing or RBAC; embedding Identity/User objects; Membership → Identity/Booking/Commerce/Auth package imports; Application → Membership Provider; implementing charge/plan/permission adapters in this phase.

---

## DEC-AVAILABILITY-BOUNDARY-001 — Availability Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 70 introduces the Availability Engine so MotanOS can define temporal usability and capacity rules independently of Booking (usage intent), Calendar (what events exist), and Resource (what physical/logical assets exist). Availability must not absorb Booking and must not become a Calendar product. Distinct from the Booking Availability Policy Boundary (opaque policy context inside `@motanos/booking`).

**Decision:**

* **Ownership:** `Availability`, factories, and `AvailabilityPort` live in `@motanos/availability` (`packages/engines/availability`). Availability is an independent bounded context — not Booking, Resource, Experience, Calendar, Commerce, Auth, or Runtime adapters.
* **Pipeline relation:** Resource Definition → Availability Boundary → Booking Intent → Booking Lifecycle. Availability answers “when may something be used?”
* **Separations:** Availability ≠ Booking (does not know bookings; Booking may consume availability later). Availability ≠ Calendar (events vs usable windows). Availability ≠ Resource (asset vs temporal rule). Availability Engine ≠ Booking Availability Policy Boundary.
* **Kinds (foundation):** `availability.schedule`, `availability.window`, `availability.capacity`, `availability.operational`.
* **Statuses (foundation):** `draft`, `active`, `paused`, `expired`, `archived`, `cancelled` (e.g. draft → active ↔ paused → archived).
* **Contract shape:** Opaque `availabilityReference`, required `tenantReference`, `availabilityKind`, `availabilityStatus`; optional opaque `resourceReference`, `experienceReference`, `scheduleReference`, `ownerReference`, controlled `metadata`. No secrets, credentials, or payment data.
* **Tenant isolation:** Availability may be bound to a tenant; cross-tenant creation is denied.
* **Future refs:** May later hold opaque `bookingReference` and richer schedule links — never full foreign aggregates.
* **Port surface:** `createAvailability` / `resolveAvailability` only. No `checkAvailability`, slot generation, resource blocking, or capacity calculators in this foundation.
* **Runtime:** Composition root for future `Availability Port → Adapter`. No database, scheduler, cron, or vendor SDKs in this foundation.
* **Dependencies:** `@motanos/availability` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** free/busy evaluation, slot materialization, Booking Runtime wiring, Calendar integration.

**Rejected:** Absorbing Booking into Availability; turning Availability into Calendar; Availability → Booking/Resource/Calendar/Payment imports; Application → Availability Provider; implementing check/generate/block/calculate adapters in this phase.

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

**Date:** 2026-08-02

**Context:** Fase 72 introduces the Commerce Engine so MotanOS can express commercial offer context — what can be acquired and at what referenced value — independently of Experience (what is offered), Payment (how money is collected), Billing (how it is invoiced), and Subscription plans. Commerce must not absorb Payment or Billing, and must not connect to Stripe or other charge rails in this phase.

**Decision:**

* **Ownership:** `CommerceOffer`, factories, and `CommercePort` live in `@motanos/commerce` (`packages/engines/commerce`). Commerce is an independent bounded context — not Booking, Experience, Membership, Payment, Billing, Stripe, or Runtime adapters.
* **Pipeline relation:** Experience / Membership / Booking → Commerce Boundary → Future Payment / Billing. Commerce answers “what costs / what can be acquired?”
* **Separations:** Commerce ≠ Payment (no charge/refund/checkout). Commerce ≠ Billing (no invoices/tax ledgers). Commerce ≠ Subscription (plans are related but distinct). Distinct from Booking commercial-context boundaries (pricing/fee/tax/etc. inside Booking).
* **Kinds (foundation):** `commerce.offer`, `commerce.product`, `commerce.service`, `commerce.registration`, `commerce.membership`, `commerce.operational`.
* **Statuses (foundation):** `draft`, `active`, `paused`, `expired`, `archived`, `cancelled` (e.g. draft → active → expired).
* **Contract shape:** Opaque `commerceReference`, required `tenantReference`, `commerceKind`, `commerceStatus`; optional opaque `nameReference`, `descriptionReference`, `experienceReference`, `membershipReference`, `bookingReference`, `priceReference`, controlled `metadata`. No card data, tokens, credentials, or payment payloads.
* **Tenant isolation:** Commerce offers may be bound to a tenant; cross-tenant creation is denied.
* **Future refs:** May later hold opaque `paymentReference` / `billingReference` — never full foreign aggregates or vendor SDKs.
* **Port surface:** `createCommerceOffer` / `resolveCommerceOffer` only. No charge, refund, invoice, subscribe, or checkout methods in this foundation.
* **Runtime:** Composition root for future `Commerce Port → Adapter`. No database, payment providers, Stripe SDK, or invoice adapters in this foundation.
* **Dependencies:** `@motanos/commerce` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** catalog UX, Payment Runtime wiring, Billing Runtime wiring, tax engines.

**Rejected:** Absorbing Payment/Billing/Subscription into Commerce; Commerce → Stripe/Payment/Invoice imports; Application → Commerce Provider; implementing charge/refund/checkout/invoice adapters in this phase.

---

## DEC-PAYMENT-BOUNDARY-001 — Payment Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 73 introduces the Payment Engine so MotanOS can express a payment intent, economic context, and lifecycle state independently of Commerce (what can be acquired), Billing (fiscal registration), and Payment Providers (how collection is executed). Payment must not absorb Commerce or Billing, and must not depend on Stripe or other vendors. Distinct from legacy `@motanos/payments` scaffolding and from Booking Payment Boundary (opaque request context inside Booking).

**Decision:**

* **Ownership:** `Payment`, factories, and `PaymentPort` live in `@motanos/payment` (`packages/engines/payment`). Payment is an independent bounded context — not Commerce, Booking, Membership, Billing, Stripe, providers, or Runtime adapters.
* **Pipeline relation:** Commerce → Payment → Payment Provider (future) → Billing (future). Payment answers “is there a payment intent and what is its state?”
* **Separations:** Payment ≠ Commerce. Payment ≠ Billing. Payment ≠ Provider. Payment ≠ Stripe. No cards, bank data, checkout, webhooks, charge/refund execution, invoices, or taxes in this foundation.
* **Kinds (foundation):** `payment.purchase`, `payment.registration`, `payment.membership`, `payment.booking`, `payment.refund`, `payment.operational`.
* **Statuses (foundation):** `draft`, `pending`, `authorized`, `completed`, `failed`, `cancelled`, `refunded` (e.g. draft → pending → authorized → completed).
* **Contract shape:** Opaque `paymentReference`, required `tenantReference`, `paymentKind`, `paymentStatus`; optional opaque `commerceReference`, `bookingReference`, `membershipReference`, `experienceReference`, `amountReference`, `currencyReference`, `providerReference`, controlled `metadata`. No card numbers, credentials, secrets, tokens, or method payloads.
* **Tenant isolation:** Payment may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createPayment` / `resolvePayment` only. No charge, capture, checkout, refund, or processCard methods in this foundation.
* **Runtime:** Composition root for future `Payment Port → Adapter`. No database, provider SDKs, or Stripe in this foundation.
* **Dependencies:** `@motanos/payment` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** provider adapters, capture/charge execution, Billing linkage, webhook handling.

**Rejected:** Absorbing Commerce/Billing into Payment; Payment → Stripe/provider/database imports; Application → Payment Provider; implementing charge/capture/checkout/refund execution in this phase.

---

## DEC-NOTIFICATION-BOUNDARY-001 — Notification Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 74 introduces the Notification Engine so MotanOS can express a communication intent, associated business context, and lifecycle state independently of messaging providers and delivery channels. Notification must not become a messaging system, must not absorb providers, and must not depend on concrete channels (email, WhatsApp, SMS, push). Distinct from legacy `@motanos/notifications` scaffolding and from Booking Notification Boundary (opaque intent inside Booking).

**Decision:**

* **Ownership:** `Notification`, factories, and `NotificationPort` live in `@motanos/notification` (`packages/engines/notification`). Notification is an independent bounded context — not Booking, Payment, Commerce, Community, Experience, Identity, providers, or Runtime adapters.
* **Pipeline relation:** Domain Event → Notification Boundary → Notification Provider (future: email / WhatsApp / SMS / push / in-app). Notification answers “is there a need to communicate something, and what is its state?”
* **Separations:** Notification ≠ Provider. Notification ≠ Email. Notification ≠ WhatsApp. Notification ≠ Delivery System. No SMTP, SendGrid, Twilio, Firebase/FCM, HTML templates, final message bodies, real sends, or provider tracking in this foundation.
* **Kinds (foundation):** `notification.alert`, `notification.reminder`, `notification.confirmation`, `notification.invitation`, `notification.update`, `notification.operational`.
* **Statuses (foundation):** `draft`, `pending`, `scheduled`, `sent`, `failed`, `cancelled` (e.g. draft → pending → scheduled → sent).
* **Contract shape:** Opaque `notificationReference`, required `tenantReference`, `notificationKind`, `notificationStatus`; optional opaque `actorReference`, `bookingReference`, `paymentReference`, `membershipReference`, `communityReference`, `experienceReference`, `channelReference`, controlled `metadata`. No email addresses, phone numbers, credentials, tokens, or provider secrets.
* **Tenant isolation:** Notification may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createNotification` / `resolveNotification` only. No sendEmail, sendWhatsapp, sendPush, sendSMS, deliver, or dispatch methods in this foundation.
* **Runtime:** Composition root for future `Notification Port → Adapter`. No database, external APIs, or channel SDKs in this foundation.
* **Dependencies:** `@motanos/notification` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** provider adapters, template engines, delivery tracking, channel selection policies.

**Rejected:** Turning Notification into a messaging product; Notification → WhatsApp/email/Twilio/Firebase imports; Application → Notification Provider; implementing real delivery or template rendering in this phase.

---

## DEC-AUDIT-BOUNDARY-001 — Audit Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 75 introduces the Audit Engine so MotanOS can represent audit events, traceability, action context, and future history independently of authentication, authorization, RBAC, user management, database logging, SIEM, and monitoring infrastructure. Audit answers “what happened” — not “who is allowed to do it.”

**Decision:**

* **Ownership:** `AuditEvent`, factories, and `AuditPort` live in `@motanos/audit` (`packages/engines/audit`). Audit is an independent bounded context — not Identity, Auth, Permissions, Database, or Analytics.
* **Pipeline relation:** Authorization (“may they?”) → Domain Action (“they did”) → Audit Boundary (“it is recorded”) → future Audit Storage / Analytics. Any engine action (Booking, Payment, Community, Membership, Commerce, …) may emit opaque audit events.
* **Separations:** Audit ≠ Authentication. Audit ≠ Authorization. Audit ≠ RBAC. Audit ≠ User management. Audit ≠ Database logging. Audit ≠ SIEM. Audit ≠ Monitoring infrastructure.
* **Kinds (foundation):** `audit.creation`, `audit.update`, `audit.deletion`, `audit.access`, `audit.lifecycle`, `audit.operational`.
* **Statuses (foundation):** `pending`, `recorded`, `archived`, `failed`, `cancelled` (e.g. pending → recorded).
* **Contract shape:** Opaque `auditReference`, required `tenantReference`, `auditKind`, `auditStatus`; optional opaque `actorReference`, `entityReference`, `entityKind`, `actionReference`, `sourceReference`, controlled `metadata`. No passwords, tokens, JWTs, credentials, or capability catalogs.
* **Tenant isolation:** Audit events may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createAuditEvent` / `resolveAuditEvent` only. No storeAudit, writeDatabaseLog, or sendLog methods in this foundation.
* **Runtime:** Composition root for future `Audit Port → Adapter`. No database, external APIs, or analytics SDKs in this foundation.
* **Dependencies:** `@motanos/audit` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** audit storage adapters, analytics pipelines, history query APIs, SIEM integrations.

**Rejected:** Turning Audit into auth/permissions; Audit → database/Supabase imports; Application → Audit Storage; implementing real persistence or monitoring in this phase.

---

## DEC-ANALYTICS-BOUNDARY-001 — Analytics Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 76 introduces the Analytics Engine so MotanOS can express measurable business signals, metric context, and future aggregated activity independently of dashboards, external BI, Google Analytics, Mixpanel, data warehouses, SQL queries, and analytical storage. Analytics answers “what is happening in the system and what signals can we measure?” — not how information is stored, visualized, or exploited.

**Decision:**

* **Ownership:** `AnalyticsEvent`, factories, and `AnalyticsPort` live in `@motanos/analytics` (`packages/engines/analytics`). Analytics is an independent bounded context — not Audit, Database, Billing, Commerce, Booking, or external analytics providers.
* **Pipeline relation:** Domain Event / Audit Event → Analytics Boundary → future Metrics / Reporting / BI. Analytics interprets business facts as measurable signals; visualization and storage live elsewhere.
* **Separations:** Analytics ≠ Audit. Analytics ≠ Dashboard. Analytics ≠ BI Provider. Analytics ≠ Data Warehouse. No Google Analytics, Mixpanel, Amplitude, chart UIs, SQL queries, ETL pipelines, or fiscal reporting in this foundation.
* **Kinds (foundation):** `analytics.usage`, `analytics.lifecycle`, `analytics.engagement`, `analytics.conversion`, `analytics.performance`, `analytics.operational`.
* **Statuses (foundation):** `draft`, `pending`, `recorded`, `processed`, `archived`, `failed`, `cancelled` (e.g. draft → pending → recorded → processed).
* **Contract shape:** Opaque `analyticsReference`, required `tenantReference`, `analyticsKind`, `analyticsStatus`; optional opaque `actorReference`, `entityReference`, `entityKind`, `sourceReference`, `metricReference`, controlled `metadata`. No personal data, credentials, tokens, or visitor/client identifiers. Future opaque links to audit/booking/payment/commerce/community/experience via `entityReference` / `sourceReference` — never engine imports.
* **Tenant isolation:** Analytics events may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createAnalyticsEvent` / `resolveAnalyticsEvent` only. No track, sendEvent, publishMetric, queryAnalytics, or generateReport methods in this foundation.
* **Runtime:** Composition root for future `Analytics Port → Adapter`. No database, external APIs, or BI SDKs in this foundation.
* **Dependencies:** `@motanos/analytics` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** metric aggregation, reporting adapters, BI provider integrations, query APIs.

**Rejected:** Turning Analytics into a BI product; Analytics → Google/Mixpanel/Amplitude/warehouse imports; Application → Analytics Provider; implementing dashboards, SQL, or ETL in this phase.

---

## DEC-WORKFLOW-BOUNDARY-001 — Workflow Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 77 introduces the Workflow Engine so MotanOS can define business processes, step sequences, and coordination across bounded contexts without absorbing domain logic or becoming an automation / job / cron platform. Workflow answers “which steps form a business process?” — not how those steps are run technically.

**Decision:**

* **Ownership:** `Workflow`, factories, and `WorkflowPort` live in `@motanos/workflow` (`packages/engines/workflow`). Workflow is an independent bounded context — not Booking, Payment, Notification, Audit, Analytics, Identity, or Database.
* **Pipeline relation:** Business Trigger → Workflow Boundary → Domain Actions (Booking / Payment / Notification / Membership / Commerce / …) → future Workflow Runtime. Domain engines own “what they do”; Workflow owns process shape; Automation Provider (future) owns how steps run automatically.
* **Separations:** Workflow ≠ Automation. Workflow ≠ Job Queue. Workflow ≠ Domain Logic. Workflow ≠ Scheduler. No booking/payment/notification delivery logic, cron, queue workers, external automation tools (e.g. n8n), database workflow state, or user permissions in this foundation.
* **Kinds (foundation):** `workflow.business`, `workflow.lifecycle`, `workflow.onboarding`, `workflow.operation`, `workflow.approval`, `workflow.operational`.
* **Statuses (foundation):** `draft`, `active`, `paused`, `completed`, `cancelled`, `archived`, `failed` (e.g. draft → active → completed).
* **Contract shape:** Opaque `workflowReference`, required `tenantReference`, `workflowKind`, `workflowStatus`; optional opaque `nameReference`, `descriptionReference`, `triggerReference`, `ownerReference`, `parentWorkflowReference`, controlled `metadata`. No passwords, tokens, credentials, or secrets. Future opaque links to booking/payment/notification/audit/analytics/experience — never engine imports.
* **Tenant isolation:** Workflow may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createWorkflow` / `resolveWorkflow` only. No executeWorkflow, runWorkflow, scheduleWorkflow, triggerWorkflow, or processStep methods in this foundation.
* **Runtime:** Composition root for future `Workflow Port → Adapter`. No database, queues, cron, or external automation SDKs in this foundation.
* **Dependencies:** `@motanos/workflow` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** step definitions, runtime execution, scheduling, workers, cross-engine orchestration adapters.

**Rejected:** Absorbing domain logic into Workflow; Workflow → n8n/cron/queue imports; Application → Workflow Runtime; implementing real step execution or scheduling in this phase.

---

## DEC-POLICY-BOUNDARY-001 — Policy Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 78 introduces the Policy Engine so MotanOS can express configurable business rules, conditions that must hold, and future decision criteria independently of user permissions, roles, authentication, workflow runtime, domain engine internals, and hardcoded rules inside other engines. Policy answers “under what conditions may something occur?” — not which action to run.

**Decision:**

* **Ownership:** `Policy`, factories, and `PolicyPort` live in `@motanos/policy` (`packages/engines/policy`). Policy is an independent bounded context — not Booking, Membership, Commerce, Workflow, Permissions, Identity, or Database.
* **Pipeline relation:** Authorization (“may they?”) → Policy (“under what conditions?”) → Domain Engine (“what operation exists?”) → Workflow (“what process connects steps?”). Context → Policy Boundary → Decision Context (Booking / Membership / Commerce / Community / Experience) → future Policy Evaluation Runtime.
* **Separations:** Policy ≠ Permissions. Policy ≠ Workflow. Policy ≠ Domain Logic. Policy ≠ Authorization. No roles, users, auth, execution, scheduler, database rules, or feature flags in this foundation.
* **Kinds (foundation):** `policy.business`, `policy.membership`, `policy.booking`, `policy.commerce`, `policy.resource`, `policy.operational`.
* **Statuses (foundation):** `draft`, `active`, `paused`, `expired`, `archived`, `cancelled` (e.g. draft → active → expired).
* **Contract shape:** Opaque `policyReference`, required `tenantReference`, `policyKind`, `policyStatus`; optional opaque `nameReference`, `descriptionReference`, `contextReference`, `ownerReference`, `parentPolicyReference`, controlled `metadata`. No passwords, tokens, credentials, or secrets. Future opaque links to booking/membership/commerce/resource/workflow/identity — never engine imports.
* **Tenant isolation:** Policy may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createPolicy` / `resolvePolicy` only. No evaluatePolicy, executePolicy, validateDecision, applyPolicy, or runRule methods in this foundation.
* **Runtime:** Composition root for future `Policy Port → Adapter`. No database, evaluation runtime, or providers in this foundation.
* **Dependencies:** `@motanos/policy` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** condition expression language, evaluation runtime, decision adapters, cross-engine policy application.

**Rejected:** Substituting Permissions with Policy; absorbing domain logic into Policy; Policy → Permissions/Auth/Database imports; Application → Policy Evaluation Runtime; implementing real evaluation or rule execution in this phase.

---

## DEC-CONFIGURATION-BOUNDARY-001 — Configuration Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 79 introduces the Configuration Engine so MotanOS can express contextual / tenant-scoped configurable values, operational preferences, and future behaviour parameters independently of external feature-flag services, secrets, environment variables, deployment configuration, database settings, permissions, and business rules. Configuration answers “what configuration applies in this context?” — not what the system must do.

**Decision:**

* **Ownership:** `Configuration`, factories, and `ConfigurationPort` live in `@motanos/configuration` (`packages/engines/configuration`). Configuration is an independent bounded context — not Tenant Management, Permissions, Policy, Workflow, Database, or Deployment. Distinct from shared `@motanos/config` tooling.
* **Pipeline relation:** Tenant / Context → Configuration Boundary → future Configuration Resolution → Domain Engines (Booking / Commerce / Community / Experience / Membership). Domain engines own behaviour; Feature Flag Provider owns technical activation; Environment owns how the system is deployed.
* **Separations:** Configuration ≠ Feature Flags. Configuration ≠ Secrets. Configuration ≠ Environment. Configuration ≠ Policy. No LaunchDarkly, API keys, environment variables, roles, business rules, or database settings in this foundation.
* **Kinds (foundation):** `configuration.tenant`, `configuration.feature`, `configuration.operational`, `configuration.experience`, `configuration.business`, `configuration.system`.
* **Statuses (foundation):** `draft`, `active`, `paused`, `expired`, `archived`, `cancelled` (e.g. draft → active → expired).
* **Contract shape:** Opaque `configurationReference`, required `tenantReference`, `configurationKind`, `configurationStatus`; optional opaque `nameReference`, `contextReference`, `valueReference`, `ownerReference`, `parentConfigurationReference`, controlled `metadata`. No passwords, tokens, credentials, secrets, or API keys. Future opaque links to tenant/feature/policy/experience/booking — never engine imports.
* **Tenant isolation:** Configuration may be bound to a tenant; cross-tenant creation is denied.
* **Port surface:** `createConfiguration` / `resolveConfiguration` only. No getConfig, setFeatureFlag, resolveRuntimeConfig, loadEnvironment, or readSecret methods in this foundation.
* **Runtime:** Composition root for future `Configuration Port → Adapter`. No database, external config services, or providers in this foundation.
* **Dependencies:** `@motanos/configuration` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** value resolution runtime, storage adapters, flag-provider bridges, hierarchical override rules.

**Rejected:** Turning Configuration into a feature-flag product; absorbing Policy or Tenant Management; Configuration → LaunchDarkly/secrets/database imports; Application → Configuration Provider; implementing runtime resolution or deployment config in this phase.

---

## DEC-TENANT-BOUNDARY-001 — Tenant Engine Boundary Foundation

**Status:** ACCEPTED (foundation)

**Date:** 2026-08-02

**Context:** Fase 80 introduces the Tenant Engine so MotanOS can express the organization that uses the system, the primary multi-tenant isolation context, installation lifecycle, and the root reference shared by other engines — independently of users, identity, authentication, memberships, billing, permissions, configuration, and physical resources. Tenant answers “which organizational context does an operation live in?” — not who the person is or what they may do.

**Decision:**

* **Ownership:** `Tenant`, factories, and `TenantPort` live in `@motanos/tenant` (`packages/engines/tenant`). Tenant is an independent bounded context — not Identity, Membership, Permissions, Commerce, Payment, Configuration, or Database.
* **Pipeline relation:** Tenant Definition → Tenant Boundary → Domain Engines (Identity / Membership / Community / Experience / Resource / Booking / Commerce / Configuration). Tenant owns organizational root context; other engines reference it opaquely via `tenantReference`.
* **Separations:** Tenant ≠ Identity. Tenant ≠ Membership. Tenant ≠ Billing. Tenant ≠ Permissions. Tenant ≠ Configuration. No login, auth providers, roles, payments, subscriptions, internal config, or database in this foundation.
* **Kinds (foundation):** `tenant.organization`, `tenant.business`, `tenant.club`, `tenant.restaurant`, `tenant.platform`, `tenant.operational`.
* **Statuses (foundation):** `draft`, `active`, `suspended`, `inactive`, `archived`, `cancelled` (e.g. draft → active → suspended → archived).
* **Contract shape:** Opaque `tenantReference`, required `tenantKind`, `tenantStatus`; optional opaque `nameReference`, `descriptionReference`, `ownerReference`, `parentTenantReference`, controlled `metadata`. No passwords, tokens, credentials, secrets, or API keys.
* **Tenant isolation:** Empty `tenantReference` is denied; optional bound context may require an exact root reference match.
* **Port surface:** `createTenant` / `resolveTenant` only. No createUser, inviteMember, assignRole, activateSubscription, or configureTenant methods in this foundation.
* **Runtime:** Composition root for future `Tenant Port → Adapter`. No database, auth integration, or providers in this foundation.
* **Dependencies:** `@motanos/tenant` limited to `@motanos/contracts` + `@motanos/core`.
* **Deferred:** tenant hierarchy policies, provisioning adapters, billing linkage, admin consoles.

**Rejected:** Turning Tenant into User Management; absorbing Billing or Authorization; Tenant → Identity/Auth/Stripe/database imports; Application → Tenant Provider; implementing people, subscriptions, or configuration inside Tenant in this phase.

---
