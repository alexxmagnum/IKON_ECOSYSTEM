/**
 * @motanos/database — MotanOS data runtime (Drizzle + identity schema).
 * Phase 3: identity tables only. DEC-001: no club_id / tenant_id.
 */
export {
  createDatabase,
  getDatabase,
  hasDatabaseUrl,
  schema,
  type Database,
} from "./client";
export * from "./schema";
