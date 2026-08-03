# `@motanos/booking-lifecycle`

Shared Booking Engine foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → @motanos/booking-lifecycle → Domain Modules
```

This package is platform infrastructure. It does not belong to a customer implementation or to any consuming domain module.

## Scope (current)

- Domain types: Resource, Booking, Availability
- BOOKING / RESOURCE statuses aligned with SoT state machines
- Availability check helpers (`checkRangeAvailability`, BR-0031 overlaps)
- Domain event contracts + emission helpers (`emitBooking*`) on mutation results
- API-oriented TypeScript contracts (no HTTP handlers)
- Service interfaces only (no persistence adapters)

## Out of scope (current)

- User booking flows / UI / calendars
- Schema migrations / ORM wiring
- External payment providers
- Domain-specific booking adapters
- Event bus / brokers / consumers / event sourcing

## Dependencies

Allowed: `@motanos/core`, `@motanos/contracts`

Forbidden: customer implementation packages, domain packages, persistence packages, Next.js, auth vendors, payment vendors
