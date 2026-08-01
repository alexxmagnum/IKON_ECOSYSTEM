import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Permission catalog foundation.
 * Concrete permission keys will be aligned to docs/27_PERMISSIONS.md later.
 */
export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
