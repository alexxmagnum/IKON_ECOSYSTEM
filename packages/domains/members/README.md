# `@motanos/domain-members`

Members Domain Module foundation for MotanOS.

## Placement

```
MotanOS Core → Identity Foundation → Members Domain
```

Members adds business membership knowledge. It does not replace Identity.

## Scope (current)

- Domain types: Member, Membership, MembershipPlan
- MEMBERSHIP statuses aligned with SoT state machines
- Opaque `identityReference` to Identity Core
- Future opaque refs for Events / Booking participation and Payments
- Contracts and service interfaces

## Out of scope (current)

- Auth, sessions, passwords, security roles
- Real billing, invoices, subscriptions
- Persistence, migrations, gateways
- Profile UI / admin panels
- Customer branding packages

## Dependencies

Allowed: `@motanos/contracts`

Forbidden: `@motanos/auth`, `@motanos/database`, `@motanos/permissions`, customer branding packages, Next.js, infrastructure SDKs
