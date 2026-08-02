# `@motanos/runtime`

Runtime Composition / composition root for MotanOS.

## Placement

```
External entry → @motanos/runtime (composition root)
  → API
  → Application
  → Permissions
  → Booking Engine
```

Lower layers must **not** import Runtime.

## Public API

| Export | Role |
|--------|------|
| `createMotanOSRuntime()` | Official MotanOS bootstrap (composition root) |
| `createRuntime()` | Primitive: config + registry + context |
| `MotanOSComposedRuntime` | Typed bootstrap result |
| `RUNTIME_SERVICE_TOKENS` | Well-known registry keys |
| Runtime / error contracts | Shared types |

**Not public:** `src/providers/*` (temporary in-memory factories for bootstrap/tests).

## Separation

```
createMotanOSRuntime()
  → builds Authorization, Booking, CreateBooking, Application, API
  → createRuntime({ config, services })
       → registry + context only
```

## Bootstrap

```ts
import { createMotanOSRuntime } from "@motanos/runtime";

const {
  createBooking,
  confirmBooking,
  cancelBooking,
  createBookingHandler,
  confirmBookingHandler,
  cancelBookingHandler,
} = createMotanOSRuntime();
```

Overrides (future adapters): `createMotanOSRuntime({ authorization, booking })`.

## Out of scope

- HTTP servers / Next routes
- Persistence / vendor clients
- Credential loading
- Domains beyond Booking for this slice

## Allowed dependencies

`@motanos/api`, `@motanos/application`, `@motanos/permissions`, `@motanos/booking`

Forbidden: other engines/domains, persistence packages, auth packages, payment vendors, Next.js
