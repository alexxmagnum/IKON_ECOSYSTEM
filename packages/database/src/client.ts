import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { requireDatabaseUrl } from "@motanos/config/server";

import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;

/**
 * Creates a Drizzle client. Requires DATABASE_URL at call time.
 * No connection is opened at module import (safe for CI/typecheck).
 */
export function createDatabase(connectionString?: string) {
  const url = connectionString ?? requireDatabaseUrl();
  const client = postgres(url, { prepare: false });
  return drizzle(client, { schema });
}
