# Booking Boundary Freeze

**Status:** ACCEPTED  
**Date:** 2026-08-02  
**Phase:** 64  
**Decision:** [DEC-BOOKING-FREEZE-001](./DECISIONS.md#dec-booking-freeze-001--booking-boundary-freeze--ecosystem-integration-map)  
**Package:** `@motanos/booking` (`packages/engines/booking`)

---

## Purpose

After the Booking domain foundation phases, this document **freezes** the Booking boundary model.

It does **not** add new Booking Boundaries.

It:

* audits that responsibilities are correctly separated
* identifies capabilities that belong to other MotanOS engines
* defines future integration points
* states what Booking must never become

Booking is **not** the MotanOS product.

Booking is a **capability** of the MotanOS ecosystem for managing moments, experiences, and reserved capacity.

---

## Booking Responsibility

### MotanOS ecosystem vision

```
                    MotanOS Ecosystem

                           Community
                              |
                              |
Experience ───────── Booking Engine ───────── Commerce
                              |
                              |
                         Operations
                              |
                              |
                         Business OS
```

### Connection role

```
Community
    ↓
Experience
    ↓
Booking
    ↓
Participation
    ↓
Commerce
    ↓
Retention
```

### What Booking owns (frozen)

| Area | Ownership |
|------|-----------|
| Reservation lifecycle | ✅ Booking |
| Operation intents (cancel, reschedule, modify, …) | ✅ Booking |
| Participants linked to a booking | ✅ Booking |
| Recurrence rules for booking intent | ✅ Booking |
| Waitlist demand context | ✅ Booking |
| Commercial *context* attached to a booking | ✅ Booking (not a billing system) |
| Opaque references to external engines | ✅ Booking consumes refs only |

### What Booking answers

> “There is a reservation intent / lifecycle moment / participant / recurrence / waitlist / commercial context for this booking.”

### What Booking does **not** answer

| Question | Owner |
|----------|--------|
| Who is the user? | Identity / Auth |
| Is the person a member? | Membership Engine |
| Who pays / how? | Payment / Commerce |
| What physical asset is it? | Resource Engine |
| When is there free capacity? | Availability Engine |
| How is time visualized? | Calendar Engine |
| Who gets notified? | Notification Engine |
| Social graph / groups? | Community Engine |

---

## Existing Boundaries

Inventory of foundation boundaries under `packages/engines/booking/src/` (as of Phase 64).

Each approved conceptual boundary typically ships with: **contract**, **factory**, **port** (prepared, not wired), **tests**, and a **DEC**.

### Core lifecycle

| Boundary | Path | DEC | Status |
|----------|------|-----|--------|
| Booking aggregate + service | `domain/`, `services/` | (module foundation) | ✅ Booking |
| Check-in | `checkins/` | DEC-BOOKING-CHECKIN-001 | ✅ Booking |
| Completion | `completions/` | DEC-BOOKING-COMPLETION-001 | ✅ Booking |
| Cancellation | `cancellations/` | DEC-BOOKING-CANCELLATION-001 | ✅ Booking |

Lifecycle moments (creation → confirmation → check-in → completion / cancellation) stay inside Booking.

### Derived operations (intent ≠ execution)

| Boundary | Path | DEC | Status |
|----------|------|-----|--------|
| Modification | `modifications/` | DEC-BOOKING-MODIFICATION-001 | ✅ Booking |
| Reschedule | `reschedules/` | DEC-BOOKING-RESCHEDULE-001 | ✅ Booking |
| No-show | `no-shows/` | DEC-BOOKING-NOSHOW-001 | ✅ Booking |
| Exception | `exceptions/` | DEC-BOOKING-EXCEPTION-001 | ✅ Booking |
| Approval | `approvals/` | DEC-BOOKING-APPROVAL-001 | ✅ Booking |

**Rule:** Intent boundaries express a request/context. They do **not** directly mutate the booking as a side effect of the boundary factory. Future transitions remain Booking Service / Application responsibility.

```
Correct:
  User requests change → Modification Boundary → Future Booking Transition

Incorrect:
  Modification Boundary → silently mutates Booking aggregate
```

### Capacity & demand

| Boundary | Path | DEC | Represents | Does **not** represent |
|----------|------|-----|------------|-------------------------|
| Waitlist | `waitlists/` | DEC-BOOKING-WAITLIST-001 | Demand without capacity | Availability engine |
| Recurrence | `recurrences/` | DEC-BOOKING-RECURRENCE-001 | Repetition rule | Calendar / scheduler / mass generator |
| Participant | `participants/` | DEC-BOOKING-PARTICIPANT-001 | Person/entity on a booking | User / member / customer / payer |

### Commercial context (associated to a booking)

| Boundary | Path | DEC | Status |
|----------|------|-----|--------|
| Pricing | `pricing/` | DEC-BOOKING-PRICING-001 | ✅ Keep (context) |
| Discount | `discounts/` | DEC-BOOKING-DISCOUNT-001 | ✅ Keep (context) |
| Fee | `fees/` | DEC-BOOKING-FEE-001 | ✅ Keep (context) |
| Tax | `taxes/` | DEC-BOOKING-TAX-001 | ✅ Keep (context) |
| Balance | `balances/` | DEC-BOOKING-BALANCE-001 | ✅ Keep (context) |
| Settlement | `settlements/` | DEC-BOOKING-SETTLEMENT-001 | ✅ Keep (context) |
| Invoice | `invoices/` | DEC-BOOKING-INVOICE-001 | ✅ Keep (context) |
| Document | `documents/` | DEC-BOOKING-DOCUMENT-001 | ✅ Keep (context) |

**Decision:** These remain because they model commercial *context* for a reservation.

**Constraint:** Booking ≠ Billing System. Real charging, ledgers, and accounting belong to Commerce.

```
Booking
   |
   ↓
Commerce Engine (future)
   |
   ├── Payment
   ├── Billing
   ├── Accounting
   └── Revenue
```

### Policy / integration context (Booking-side ports only)

These are **Booking policy/context boundaries** that consume opaque references. They are **not** the owning engines.

| Boundary | Path | DEC | External owner (future) |
|----------|------|-----|-------------------------|
| Availability (policy request) | `availability/` | DEC-BOOKING-AVAILABILITY-001 | Availability Engine |
| Resource (opaque resource context) | `resources/` | DEC-BOOKING-RESOURCE-001 | Resource Engine |
| Membership (opaque membership context) | `memberships/` | DEC-BOOKING-MEMBERSHIP-001 | Membership Engine |
| Payment (payment *request* context) | `payments/` + integration ports | DEC-BOOKING-PAYMENT-001 | Commerce / Payment |
| Notification (notification *intent*) | `notifications/` + integration ports | DEC-BOOKING-NOTIFICATION-001 | Notification Engine |
| Workflow | `workflows/` | DEC-BOOKING-WORKFLOW-001 | Orchestration / Ops |
| Policy | `policies/` | DEC-BOOKING-POLICY-001 | Rules evaluation context |
| Integration ports | `integrations/` | DEC-BOOKING-INTEGRATION-001 | Runtime adapters |
| Audit | `audit/` | DEC-BOOKING-AUDIT-001 | Observability / compliance |
| Tenant / Auth / Query / Persistence | `context/`, auth policy, `queries/`, `repositories/` | DEC-BOOKING-TENANT-001, AUTH-001, QUERY-*, PERSISTENCE-001 | Platform / Runtime |

---

## Approved Boundaries

**Freeze rule:** No new Booking Boundaries without an explicit new DEC that revises this freeze.

Approved responsibility set:

* ✅ Reservation lifecycle
* ✅ Operation intents
* ✅ Participants
* ✅ Recurrence rules
* ✅ Waitlist demand
* ✅ Commercial context attached to a booking
* ✅ Opaque integration/policy ports toward other engines

---

## External Engines

### Booking ≠ Community

Community owns: users (social), relationships, groups, social activity, interaction.

Booking only consumes references (e.g. `actorReference`).

### Booking ≠ Identity

Identity owns: account, login, profile, authentication.

Booking may hold: `actorReference`, `identityReference` (opaque).

### Booking ≠ Membership

Membership owns: members, plans, benefits, tier, member status.

Booking may hold: `membershipReference` (opaque).

### Booking ≠ Payment / Commerce

Payment/Commerce owns: charge, payment methods, transactions, real refunds, billing, accounting.

Booking owns: economic *context* only (pricing/discount/fee/tax/balance/settlement/invoice/document intents).

### Booking ≠ Resource Engine

Resource owns: table, golf course, court, room, equipment.

Booking holds: `resourceReference` / resource context — not inventory truth.

### Booking ≠ Notification

Notification owns: email, WhatsApp, push, reminders.

Booking may emit domain events / notification intents; delivery is external.

### Booking ≠ Calendar Engine

Calendar owns: temporal visualization / occurrence presentation.

Booking owns: reservation intent and lifecycle — not a calendar product.

### Booking ≠ Availability Engine

Availability owns: free capacity / slots.

Booking owns: the reservation request and conflict rules in its own aggregate — not the capacity marketplace.

---

## Integration Points

### Target map

```
                 Community Engine

                        |
                        |

Experience Engine ─── Booking Engine ─── Commerce Engine

                        |

                Resource Engine

                        |

              Membership Engine
```

### Integration style (frozen)

```
External Engine
      ↓
Opaque reference / Port adapter (Runtime)
      ↓
Booking Boundary / Service
```

Rules:

* Application must **not** depend on vendor providers (`Application → X Provider` forbidden).
* Runtime composes `Port → Adapter`.
* Booking packages depend only on `@motanos/contracts` and `@motanos/core` (no Stripe, Supabase, secrets, persistence vendors).
* Cross-engine coupling is by **opaque references** and **domain events**, not shared mutable models.

### Future hand-offs (examples)

| From Booking | To | Via |
|--------------|----|-----|
| Payment request context | Commerce / Payment | `BookingPaymentPort` / events |
| Notification intent | Notification Engine | `BookingNotificationPort` / events |
| Resource reference | Resource Engine | opaque `resourceReference` |
| Membership reference | Membership Engine | opaque `membershipReference` |
| Identity reference | Identity | opaque `identityReference` |
| Participant | Identity / Membership / Notification later | refs only |
| Recurrence rule | Calendar / occurrence materializer later | rule ≠ calendar |
| Waitlist entry | Availability + Booking creation later | demand ≠ capacity |

---

## Forbidden Responsibilities

Do **not** build these *as products* inside `@motanos/booking`:

| Forbidden | Why |
|-----------|-----|
| ❌ Calendar Engine | Calendar = temporal visualization; Booking = reservation intent |
| ❌ Availability Engine | Availability = capacity; Booking = request |
| ❌ Resource Engine | Resource = what is reserved; Booking = who/when intent |
| ❌ Membership Engine | Membership = business relationship; Booking = concrete experience moment |
| ❌ Community Engine | Community = relationships/participation; Booking = concrete moment |
| ❌ Identity / Auth product | Account/login/profile live elsewhere |
| ❌ Real payment rails | Charging/refunds/settlement execution live in Commerce |
| ❌ Notification delivery | Channels live in Notification Engine |
| ❌ Scheduler / cron / mass booking generators | Recurrence is a rule, not a job runner |

Existing Booking-side **policy/context** folders (`availability/`, `resources/`, `memberships/`, `payments/`, `notifications/`, …) remain as **integration boundaries**, not as replacements for those engines.

---

## Export Surface

Public API: `packages/engines/booking/src/index.ts`

### Goals

* Clean public exports
* Avoid duplicate type names
* Preserve legacy compatibility where needed

### Participant naming (Phase 63 resolution)

```
Legacy aggregate party shape (domain/booking.ts)
        ↓
BookingAggregateParticipant   ← package-root alias

New Participant Boundary
        ↓
BookingParticipant            ← canonical for new work
```

Do not reintroduce a package-root name collision between domain and boundary types.

### Dependency freeze

`@motanos/booking` dependencies:

* `@motanos/contracts`
* `@motanos/core`

Forbidden in this package (scan target): `stripe`, `supabase`, `apiKey`, `database` vendor coupling.

---

## Test Coverage (audit snapshot)

Recorded at Phase 64 freeze:

| Suite | Tests |
|-------|------:|
| `@motanos/booking` | **178** |
| `@motanos/application` | **24** |
| `@motanos/api` | **14** |
| `@motanos/runtime` | **12** |

Boundary test files: `packages/engines/booking/tests/*-boundary.test.ts` (**29** files).

Expectation for each conceptual boundary: contract + factory + port + tests + DEC.

---

## Future Roadmap

### Stay inside Booking (evolution, not new engines)

* Wire Runtime adapters for prepared ports
* Materialize lifecycle transitions from intents
* Harden tenant/auth/audit/query/persistence composition
* Keep commercial context in sync with Commerce contracts (still Booking-owned context)

### Build outside Booking

| Engine | Responsibility |
|--------|----------------|
| Community | Social graph, groups, activity |
| Experience | Experiences/products sold into bookings |
| Commerce | Payment, billing, accounting, revenue |
| Resource | Physical/logical reservable assets |
| Membership | Member plans and benefits |
| Identity | Accounts and authentication |
| Notification | Channel delivery |
| Calendar | Temporal views / occurrences |
| Availability | Capacity / free slots |

### Process rule

Any proposal that would:

* add a new Booking Boundary folder, or
* pull Calendar / Availability / Resource / Membership / Community / Payment rails into `@motanos/booking` as owning implementations

requires a new DEC that **explicitly revises** DEC-BOOKING-FREEZE-001.

---

## Related documents

* `docs/21_SYSTEM_ARCHITECTURE.md` — MotanOS architecture principles
* `docs/47_BOOKING_MODULE.md` — Booking module product description (historical scope; freeze supersedes “build everything inside Booking”)
* `docs/25_API_CONTRACTS.md` — API contracts
* `docs/rules/business-rules.md` — business rules
* `docs/rules/state-machines.md` — booking state machine
* `docs/project/DECISIONS.md` — DEC register (including DEC-BOOKING-FREEZE-001)
