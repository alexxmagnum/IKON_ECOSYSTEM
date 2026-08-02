# `@motanos/discovery`

Shared Discovery / Recommendation Engine foundation for MotanOS.

## Placement

```
MotanOS Core → Shared Engines → @motanos/discovery → Domain Modules
```

Discovery is a transversal engine (DEC-DISCOVERY-001). Recommendation is a capability
inside Discovery, not a separate engine. Domains consume Discovery; it never depends
on domains or on `@motanos/social` (DEC-DISCOVERY-004).

## Scope (current)

- Domain types: Recommendation, DiscoveryPreference, DiscoveryCriteria
- Provisional recommendation statuses (DEC-DISCOVERY-002)
- Optional confidence `score` in `[0, 1]` (DEC-DISCOVERY-003)
- Opaque target, source, subject, and social references
- Contracts and service interfaces only

## Out of scope (current)

- ML, embeddings, ranking algorithms, behaviour tracking
- Real evaluation of criteria
- Persistence, migrations
- Customer branding packages

## Dependencies

Allowed: `@motanos/core`, `@motanos/contracts`

Forbidden: auth, database, permissions, domain packages, other engines, Next.js, infrastructure SDKs
