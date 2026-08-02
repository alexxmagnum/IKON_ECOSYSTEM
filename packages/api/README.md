# `@motanos/api`

API / Backend Runtime foundation for MotanOS.

## Placement

```
External Request → API Runtime → Application Layer → Domains / Engines
```

This package is the boundary between external clients and Application.
It does **not** own business endpoints, controllers, or transport adapters yet.

## Scope (current)

- `ApiRequest` / `ApiResponse` / `ApiError` contracts
- `ApiContext` (+ mapping to Application `ExecutionContext`)
- `ApiErrorMapper` (ApplicationError → ApiError)
- `ApiExecutionPipeline` / `ApiService` interfaces

## Out of scope (current)

- Real HTTP routes, controllers, or domain endpoints
- JWT / OAuth / sessions / cookies
- Database, Auth, Supabase, Stripe, Next.js
- Domain or engine imports

## Envelope alignment

`docs/25_API_CONTRACTS.md` defines a wire envelope (`data` / `error` / `meta`).
This package models the same shape with TypeScript `metadata` (aligned with Application).
HTTP status codes and transport adapters are deferred (**DECISION REQUIRED** for REST vs other).

## Dependencies

Allowed: `@motanos/application` (and transitively Application’s allowed stack).  
Also permitted by phase rules when needed: `@motanos/core`, `@motanos/contracts`, `@motanos/permissions`.

Forbidden: `@motanos/domain-*`, engines, database, auth, ikon, Next.js, Supabase, Stripe.
