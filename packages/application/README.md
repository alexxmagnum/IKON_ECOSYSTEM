# `@motanos/application`

Application Layer foundation for MotanOS.

## Placement

```
UI / API → Application Layer → Engines + Domains → Core
```

Application owns orchestration contracts (use cases, results, execution context).
It does not own deep business rules, domain entities, or persistence.

## Scope (current)

- `ExecutionContext` (opaque actor/request refs)
- `UseCase<Input, Output>` contract
- `ApplicationResult` success/failure pattern
- `ApplicationError` codes
- `ApplicationService` interface

## Out of scope (current)

- Concrete product use cases
- Auth / permissions enforcement
- Engine or domain imports
- API routes, UI, database access

## Dependencies

Allowed: `@motanos/core`, `@motanos/contracts`

Forbidden: auth, database, permissions, engines, domains, customer branding, Next.js, infrastructure SDKs
