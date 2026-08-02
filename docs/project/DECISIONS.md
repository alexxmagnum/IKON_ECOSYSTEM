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
