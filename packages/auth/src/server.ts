/**
 * Server-only auth entrypoint.
 * Includes privileged Supabase client helpers.
 */
export {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "./supabase/server";
export {
  getCurrentUser,
  getCurrentUserFromAccessToken,
  getSession,
  requireSession,
  requireUser,
  requireUserFromAccessToken,
  toMotanSession,
  toMotanUser,
} from "./session";
export type { MotanSession, MotanUser } from "./types";
