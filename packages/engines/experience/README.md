# `@motanos/experience`

Experience Engine foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → Experience Engine → Peer Modules
```

Experience owns **composition** (DEC-EXPERIENCE-001) and the **Experience Boundary** contract (DEC-EXPERIENCE-BOUNDARY-001 / FASE 88). It is a Shared Engine/Layer, not a peer business module (DEC-EXPERIENCE-002). Social and peer packages own their business concepts.

## Scope (current)

- Experience Boundary: contract, factory, port (`src/experiences/`)
- Legacy aggregate types: ExperienceAggregate, Capability, Journey, JourneyStep
- Provisional aggregate / journey statuses (DEC-EXPERIENCE-003)
- Extensible capability vocabulary — no catalog yet (DEC-EXPERIENCE-004)
- Opaque cross-refs only with Discovery (DEC-EXPERIENCE-005)
- Contracts and service interfaces only

## Out of scope (current)

- UI, routes, process runners, automation
- Real booking / charge / message delivery
- Calendar Event Engine / Community Engine
- Discovery package dependency / ML / fitting engines
- Persistence, migrations
- Customer branding packages

## Dependencies

Allowed: `@motanos/core`, `@motanos/contracts`

Forbidden: auth, persistence vendors, permissions, peer packages, other engines (including discovery/social/booking/resource/payments), Next.js, infrastructure SDKs
