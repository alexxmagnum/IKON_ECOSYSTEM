import { pgTable, text, uuid } from "drizzle-orm/pg-core";

/**
 * Permission catalog foundation.
 */
export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
});
