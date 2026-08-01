import { pgTable, text, uuid } from "drizzle-orm/pg-core";

/**
 * Official roles catalog (DEC-002).
 */
export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});
