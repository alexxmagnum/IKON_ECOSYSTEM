# `@motanos/booking`

Shared Booking Engine foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → @motanos/booking → Domain Modules
```

This package is platform infrastructure. It does not belong to a customer implementation or to any consuming domain module.

## Scope (current)

- Domain types: Resource, Booking, Availability
- BOOKING / RESOURCE statuses aligned with SoT state machines
- API-oriented TypeScript contracts (no HTTP handlers)
- Service interfaces only (no persistence)

## Out of scope (current)

- User booking flows / UI / calendars
- Database migrations / Drizzle schema
- External payment providers
- Domain-specific booking adapters

## Dependencies

Allowed: `@motanos/core`, `@motanos/contracts`

Forbidden: customer implementation packages, domain packages, `@motanos/database`, Next.js, auth vendors, payment vendors
