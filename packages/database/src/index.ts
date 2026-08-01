/**
 * @motanos/database — Drizzle preparation (scaffold).
 * No business schema, tables, or migrations in Phase 1.
 * DEC-001: no club_id / tenant_id.
 */
export const DATABASE_PACKAGE = "@motanos/database" as const;

/** Placeholder marker confirming Drizzle is available for future schema work. */
export type DrizzleReady = {
  orm: "drizzle-orm";
};
