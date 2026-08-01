# `@motanos/domain-events`

Events Domain Module foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → Domain Modules → Events
```

Events is a consuming domain. It is not a shared engine.

## Scope (current)

- Domain types: Event, EventCategory, EventParticipant, EventSchedule
- EVENT + registration statuses aligned with SoT
- Contracts and service interfaces
- Typed references to Booking and Payments engines

## Out of scope (current)

- UI / visual calendars / admin panels
- Social community, chat, real notifications
- Persistence, migrations, gateways
- Customer branding packages

## Dependencies

Allowed: `@motanos/contracts`, `@motanos/booking`, `@motanos/payments`

Forbidden: `@motanos/database`, `@motanos/auth`, `@motanos/permissions`, customer branding packages, Next.js, infrastructure SDKs
