# `@motanos/application`

Application Layer for MotanOS.

## Placement

```
UI / API → Application Layer → Permissions → Engines (+ Domains) → Core
```

Application owns use-case orchestration. Deep booking rules stay in `@motanos/booking`.

## Scope (current)

- `ExecutionContext`, `UseCase`, `ApplicationResult`, `ApplicationService`
- Booking lifecycle vertical slice:
  - **CreateBooking** (`booking.create`)
  - **ConfirmBooking** (`booking.confirm`) — Draft → Confirmed
  - **CancelBooking** (`booking.cancel`) — → Cancelled
  - **CheckAvailability** (`booking.availability.check`)
  - **GetBooking** (`booking.read`)
  - **ListBookings** (`booking.list`)
  - **RescheduleBooking** (`booking.reschedule`)
  - **ExpireBookingHolds** (`booking.expire`)
- Optional `ApplicationSuccess.events` for domain event transport (DEC-BOOKING-EVENTS-002)

## Out of scope (current)

- HTTP routes / UI
- Concrete persistence adapters
- Authn providers (JWT / sessions)

## Dependencies

Allowed: `@motanos/booking`, `@motanos/permissions`, `@motanos/core`, `@motanos/contracts`

Forbidden: auth packages, domain packages, engines other than booking for this slice, Next.js, vendor SDKs
