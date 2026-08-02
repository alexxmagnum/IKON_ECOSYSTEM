# `@motanos/experience`

Experience Layer foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → Experience Layer → Domain Modules
```

Experience owns **composition** (DEC-EXPERIENCE-001). It is a Shared Engine/Layer, not a Domain Module (DEC-EXPERIENCE-002). Social and domains own their business concepts.

## Scope (current)

- Domain types: Experience, Capability, Journey, JourneyStep
- Provisional experience / journey statuses (DEC-EXPERIENCE-003)
- Extensible capability vocabulary — no catalog yet (DEC-EXPERIENCE-004)
- Opaque cross-refs only with Discovery (DEC-EXPERIENCE-005)
- Contracts and service interfaces only

## Out of scope (current)

- UI, routes, workflow runtimes, automation
- Real booking / payment / notification execution
- Discovery package dependency / ML / personalization
- Persistence, migrations
- Customer branding packages

## Dependencies

Allowed: `@motanos/core`, `@motanos/contracts`

Forbidden: auth, database, permissions, domain packages, other engines (including discovery/social), Next.js, infrastructure SDKs
