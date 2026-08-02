# `@motanos/permissions`

Authorization / Permissions foundation for MotanOS.

## Placement

```
Application Use Case → AuthorizationService.authorize(...) → Business logic
```

**Authentication** answers *who you are* (outside this package).  
**Authorization** answers *can this actor perform this action on this resource?*

## Terminology

| Term | Meaning in this package |
|------|-------------------------|
| **Authorization** | Decision process (`AuthorizationService`, `AuthorizationContext`, `AuthorizationDecision`) |
| **Permission** | Named capability / key concept (`Permission`, `PermissionKey`, `PermissionAction`) |
| **Policy** | Abstract evaluator (`PermissionPolicy`) over an authorization context |
| **Allowed / Denied** | Explicit decision outcomes (not thrown exceptions as the primary model) |
| **check** | Return a decision |
| **authorize** | Enforce / gate for an action (implementation-defined Denied handling) |

Prefer **authorization** naming for decision-making services and contexts.  
Keep **permission** naming for permission keys, actions, and DEC-002 RBAC helpers.

## Scope (current)

- Canonical `AuthorizationContext` (`actor`, `action`, `resource`, optional `metadata`)
- `AuthorizationService` (`check` / `authorize`) — `PermissionService` is a deprecated alias
- Explicit `Allowed` \| `Denied` decisions with optional reason/metadata
- DEC-002 official roles + pure RBAC helpers
- Extensible `PermissionAction` / `PermissionActionCatalog` (no domain catalogs here)

## Extending actions (domains)

Domains may define their own typed action catalogs **without** changing this package:

```ts
import type { PermissionAction } from "@motanos/permissions";

export const ExampleDomainActions = {
  Create: "example.create",
  Read: "example.read",
} as const satisfies Record<string, PermissionAction>;
```

Do not add vertical action catalogs (reservations, orders, billing, etc.) inside `@motanos/permissions`.

## Out of scope

- Login, sessions, JWT, OAuth, Auth providers
- Database row security / infrastructure policy engines
- Tenant / organization coupling
- Application use-case implementations
- Domain-specific action catalogs

## Dependencies

Allowed (if needed): `@motanos/core`, `@motanos/contracts`  

Forbidden: auth, database, application, domains, engines, UI, infrastructure SDKs

## Compatibility

- `PermissionService` → alias of `AuthorizationService`
- `PermissionPolicyRegistry` → alias of `AuthorizationPolicyRegistry`
- `CheckPermissionInput` / `AuthorizationRequest` → prefer `AuthorizationContext`
- DEC-002 RBAC exports unchanged
