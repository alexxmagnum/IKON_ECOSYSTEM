# `@motanos/application`

Application Layer for MotanOS.

## Placement

```
UI / API → Application Layer → Permissions → Engines (+ Domains) → Core
```

Application owns use-case orchestration. Deep booking rules stay in `@motanos/booking`.

## Scope (current)

- `ExecutionContext`, `UseCase`, `ApplicationResult`, `ApplicationService`
- First vertical slice: **CreateBooking**
  - `CreateBookingInput` / `CreateBookingOutput` (opaque references)
  - `createCreateBookingUseCase` → AuthorizationService → BookingService

## Out of scope (current)

- HTTP routes / UI
- Concrete persistence adapters
- Authn providers (JWT / sessions)

## Dependencies

Allowed: `@motanos/booking`, `@motanos/permissions`, `@motanos/core`, `@motanos/contracts`

Forbidden: auth packages, domain packages, engines other than booking for this slice, Next.js, vendor SDKs
