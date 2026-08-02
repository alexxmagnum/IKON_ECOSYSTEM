# `@motanos/social`

Shared Social Engine foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → @motanos/social → Domain Modules
```

Social is a transversal engine. Domains consume it; it never depends on domains.

## Scope (current)

- Domain types: SocialConnection, SocialGroup, SocialParticipation
- Connection / visibility / participation statuses
- Opaque participant and consumer references
- Contracts and service interfaces only

## Out of scope (current)

- Chat, realtime messaging, feeds, recommendation algorithms
- Profile UI
- Persistence, migrations
- Customer branding packages

## Dependencies

Allowed: `@motanos/core`, `@motanos/contracts`

Forbidden: auth, database, permissions, domain packages, other engines, Next.js, infrastructure SDKs
