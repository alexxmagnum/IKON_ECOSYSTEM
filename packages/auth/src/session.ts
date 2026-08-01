import type { Session, User } from "@supabase/supabase-js";

import type { MotanSession, MotanUser } from "./types";
import { createServerSupabaseClient } from "./supabase/server";

export function toMotanUser(user: User): MotanUser {
  return {
    id: user.id,
    email: user.email ?? null,
  };
}

export function toMotanSession(session: Session): MotanSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? null,
    user: toMotanUser(session.user),
  };
}

/**
 * Reads the current session via server Supabase client.
 * Returns null when unauthenticated or env is not configured for runtime auth.
 */
export async function getSession(): Promise<MotanSession | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return null;
  }

  return toMotanSession(data.session);
}

/**
 * Returns the authenticated Supabase user, or null.
 */
export async function getCurrentUser(): Promise<MotanUser | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return toMotanUser(data.user);
}

/**
 * Validates that a session currently exists.
 */
export async function requireSession(): Promise<MotanSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("[@motanos/auth] Authentication required.");
  }
  return session;
}
