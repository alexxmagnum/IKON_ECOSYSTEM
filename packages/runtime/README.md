# `@motanos/runtime`

Runtime Composition foundation for MotanOS.

## Placement

```
Runtime Composition
  → API
  → Application
  → Permissions
  → Domains / Engines (later, outside this package)
```

This package assembles abstract dependencies. It does not own business logic,
HTTP transport, or concrete infrastructure adapters.

## Scope (current)

- `RuntimeConfig` / `RuntimeContext`
- `ServiceRegistry` (`register` / `resolve`)
- `createRuntime()` composition factory
- Typed service slots for Application / API / Authorization contracts

## Out of scope (current)

- Real use cases, repositories, or domain services
- Concrete infrastructure adapters
- Environment file loading or vault integrations
- HTTP servers, UI, customer branding

## Dependency direction

`@motanos/runtime` may import API, Application, and Permissions.

Those packages must **not** import Runtime.

## Allowed dependencies

`@motanos/api`, `@motanos/application`, `@motanos/permissions`
(and Core / Contracts when genuinely required)

Forbidden: domain packages, engines, persistence packages, auth packages,
payment vendors, Next.js.
