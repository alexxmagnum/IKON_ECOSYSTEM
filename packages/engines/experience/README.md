# `@motanos/experience`

Experience Engine foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → Experience Engine → Domain Modules
```

Experience owns **composition** (DEC-EXPERIENCE-001) and the **Experience Boundary** offering contract (DEC-EXPERIENCE-BOUNDARY-001). It is a Shared Engine/Layer, not a Domain Module (DEC-EXPERIENCE-002). Social and domains own their business concepts.

## Scope (current)

- Experience Boundary: contract, factory, port (`src/experiences/`)
- Legacy domain types: ExperienceAggregate, Capability, Journey, JourneyStep
- Provisional aggregate / journey statuses (DEC-EXPERIENCE-003)
- Extensible capability vocabulary — no catalog yet (DEC-EXPERIENCE-004)
- Opaque cross-refs only with Discovery (DEC-EXPERIENCE-005)
- Contracts and service interfaces only

## Out of scope (current)

- UI, routes, workflow runtimes, automation
- Real booking / payment / notification execution
- Calendar Event Engine / Community Engine
- Discovery package dependency / ML / personalization
- Persistence, migrations
- Customer branding packages

## Dependencies

Allowed: `@motanos/core`, `@motanos/contracts`

Forbidden: auth, persistence vendors, permissions, domain packages, other engines (including discovery/social/booking/resource/payments), Next.js, infrastructure SDKs
