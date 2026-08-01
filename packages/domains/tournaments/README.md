# `@motanos/domain-tournaments`

Tournament Domain Module foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → Domain Modules → Tournament
```

Tournament is a consuming business domain. It is not a shared engine.

## Scope (current)

- Domain types: Tournament, TournamentCategory, TournamentParticipant, TournamentPhase
- TOURNAMENT + entry statuses aligned with SoT
- Typed references to Golf, Events, Booking, Payments
- Opaque participant references (Member / GolfPlayer / external resolved later)
- Contracts and service interfaces

## Out of scope (current)

- UI / leaderboards / full scoring / rankings
- Real bookings, charges, match engines
- Persistence, migrations, gateways
- Customer branding packages

## Dependencies

Allowed: `@motanos/contracts`, `@motanos/domain-golf`, `@motanos/domain-events`, `@motanos/domain-members`, `@motanos/booking`, `@motanos/payments`

Forbidden: `@motanos/database`, `@motanos/auth`, `@motanos/permissions`, customer branding packages, Next.js, infrastructure SDKs

Note: `@motanos/domain-members` is declared for composition readiness; participant links stay opaque strings in this foundation.
