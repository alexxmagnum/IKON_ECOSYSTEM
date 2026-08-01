/**
 * @motanos/config — MotanOS runtime configuration.
 *
 * Client-safe exports only from this entrypoint.
 * Import server helpers from `@motanos/config/server`.
 */
export {
  getPublicEnv,
  hasPublicSupabaseEnv,
  publicEnvSchema,
  type PublicEnv,
} from "./env/public";
