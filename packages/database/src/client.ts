import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "@motanos/config/server";

import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

let cached: Database | null = null;

/**
 * Creates a Drizzle client for MotanOS Postgres.
 * Connection opens lazily when this function is called.
 */
export function createDatabase(connectionString?: string): Database {
  const url = connectionString ?? getServerEnv().DATABASE_URL;
  if (!url?.trim()) {
    throw new Error(
      "[@motanos/database] DATABASE_URL is required to create a database client.",
    );
  }

  const client = postgres(url, { prepare: false, max: 10 });
  return drizzle(client, { schema });
}

/**
 * Process-scoped database client for server runtimes.
 * Safe for smoke scripts / server helpers; not for edge fan-out.
 */
export function getDatabase(): Database {
  if (!cached) {
    cached = createDatabase();
  }
  return cached;
}

export function hasDatabaseUrl(): boolean {
  return Boolean(getServerEnv().DATABASE_URL?.trim());
}

export { schema };
