/**
 * @motanos/auth — MotanOS identity runtime.
 * Client-safe exports. Import service-role helpers from `@motanos/auth/server`.
 */
export { createBrowserSupabaseClient } from "./supabase/browser";
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
