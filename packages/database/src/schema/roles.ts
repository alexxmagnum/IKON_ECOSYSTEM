import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Official roles catalog (DEC-002).
 * Seed values are out of scope for Phase 2.
 */
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
