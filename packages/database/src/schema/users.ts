import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * USER identity states (docs/24_DATABASE_SCHEMA.md / state-machines USER).
 */
export const userStatusEnum = pgEnum("user_status", [
  "Invited",
  "PendingVerification",
  "Active",
  "Suspended",
  "Deleted",
]);

/**
 * Application user linked to Supabase Auth.
 * DEC-001: no club_id / tenant_id.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: uuid("auth_user_id").notNull().unique(),
  status: userStatusEnum("status").notNull().default("PendingVerification"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
