# `@motanos/domain-golf`

Golf Domain Module foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → Domain Modules → Golf
```

Golf is a consuming domain. It is not a shared engine.

## Scope (current)

- Domain types: GolfCourse, Hole, GolfPlayer, GolfRound
- Round sports statuses (Scheduled → Completed)
- Contracts and service interfaces
- Typed references to Booking and Payments engines

## Out of scope (current)

- UI / calendars / dashboards
- Full tournaments, ranking, official handicap, scoring engine
- Persistence, migrations, gateways
- Customer branding packages

## Dependencies

Allowed: `@motanos/contracts`, `@motanos/booking`, `@motanos/payments`

Forbidden: `@motanos/database`, `@motanos/auth`, `@motanos/permissions`, customer branding packages, Next.js, infrastructure SDKs
