/**
 * Server-only configuration entrypoint.
 * Do not import this module from client components.
 */
export {
  getServerEnv,
  requireDatabaseUrl,
  requireServiceRoleKey,
  serverEnvSchema,
  type ServerEnv,
} from "./env/server";

export {
  getPublicEnv,
  hasPublicSupabaseEnv,
  publicEnvSchema,
  type PublicEnv,
} from "./env/public";
