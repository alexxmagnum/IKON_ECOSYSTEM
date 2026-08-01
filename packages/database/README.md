# @motanos/database

Drizzle + Postgres runtime for MotanOS identity foundation.

## Schema (Phase 3)

- `users`
- `profiles`
- `roles`
- `permissions`
- `user_roles`

SQL source of truth for local Supabase:

`infra/supabase/migrations/20260802000000_identity_foundation.sql`

## Usage

```ts
import { getDatabase, hasDatabaseUrl } from "@motanos/database";

if (hasDatabaseUrl()) {
  const db = getDatabase();
}
```

## Constraints

- DEC-001: no `club_id` / `tenant_id`
- No booking/payment/domain tables in this package yet
