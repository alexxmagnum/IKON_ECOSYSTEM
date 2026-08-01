import { z } from "zod";

import { getPublicEnv, publicEnvSchema } from "./public";

/**
 * Server-only environment schema.
 * Includes secrets that must never reach the frontend bundle (ADR-002 / DEC-005).
 */
export const serverEnvSchema = publicEnvSchema.extend({
  DATABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  const publicEnv = getPublicEnv(source);
  return serverEnvSchema.parse({
    ...publicEnv,
    DATABASE_URL: source.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: source.SUPABASE_SERVICE_ROLE_KEY,
  });
}

export function requireDatabaseUrl(env: ServerEnv = getServerEnv()): string {
  if (!env.DATABASE_URL) {
    throw new Error(
      "[@motanos/config] DATABASE_URL is required for database operations.",
    );
  }
  return env.DATABASE_URL;
}

export function requireServiceRoleKey(env: ServerEnv = getServerEnv()): string {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "[@motanos/config] SUPABASE_SERVICE_ROLE_KEY is required for privileged auth operations.",
    );
  }
  return env.SUPABASE_SERVICE_ROLE_KEY;
}
