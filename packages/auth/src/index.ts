/**
 * @motanos/auth — MotanOS identity foundation.
 * Client-safe exports. Import service-role helpers from `@motanos/auth/server`.
 */
export { createBrowserSupabaseClient } from "./supabase/browser";
export {
  getCurrentUser,
  getSession,
  requireSession,
  toMotanSession,
  toMotanUser,
} from "./session";
export type { MotanSession, MotanUser } from "./types";
