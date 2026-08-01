import { pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { roles } from "./roles";
import { users } from "./users";

/**
 * Many-to-many assignment of DEC-002 roles to users.
 */
export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("user_roles_user_id_role_id_uidx").on(table.userId, table.roleId)],
);
