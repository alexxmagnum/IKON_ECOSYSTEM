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
