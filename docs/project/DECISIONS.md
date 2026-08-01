# IKON_ECOSYSTEM — Architectural Decisions

---

## DEC-001 — Tenancy model (resolves AUD-001)

**Status:** Accepted

**Decision:** IKON_ECOSYSTEM v1 is **single-tenant** (one club per deployment).

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

**Decision:** Official concept names for IKON_ECOSYSTEM documentation and implementation:

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
