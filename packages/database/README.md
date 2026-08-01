# @motanos/database

Drizzle ORM foundation for MotanOS.

## Phase 2 scope

Identity tables only:

- `users`
- `profiles`
- `roles`
- `permissions`
- `user_roles`

## Out of scope

- Booking / Payment / Golf / Restaurant schemas
- Applied production migrations
- `club_id` / `tenant_id` (DEC-001)

## Usage

```ts
import { createDatabase } from "@motanos/database";

const db = createDatabase(); // requires DATABASE_URL
```
