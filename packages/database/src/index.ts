/**
 * @motanos/database — MotanOS data foundation (Drizzle).
 * Phase 2: identity tables only. No booking/payment/domain schemas.
 * DEC-001: no club_id / tenant_id.
 */
export { createDatabase, type Database } from "./client";
export * from "./schema";
