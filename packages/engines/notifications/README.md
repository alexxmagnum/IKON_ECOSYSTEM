# `@motanos/notifications`

Shared Notifications Engine foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → @motanos/notifications → Domain Modules
```

Notifications is a transversal engine. Domains consume it; it never depends on domains.

## Scope (current)

- Domain types: Notification, NotificationChannel, NotificationPreference
- NOTIFICATION statuses aligned with SoT state machines
- Opaque recipient and consumer references
- Contracts and service interfaces only

## Out of scope (current)

- Real email / SMS / push / messaging providers
- Queues, workers, Firebase, external APIs
- Persistence, migrations
- Customer branding packages

## Dependencies

Allowed: `@motanos/core`, `@motanos/contracts`

Forbidden: auth, database, permissions, domains, other engines, Next.js, infrastructure SDKs
