import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import { getPublicEnv, hasPublicSupabaseEnv } from "@motanos/config";

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

function createAccessTokenClient(accessToken: string) {
  const env = getPublicEnv();
  if (!hasPublicSupabaseEnv(env)) {
    throw new Error(
      "[@motanos/auth] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "[@motanos/auth] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Reads the current session via server Supabase client.
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
 * Resolves the current user from an access token (API / smoke / server handlers).
 */
export async function getCurrentUserFromAccessToken(
  accessToken: string,
): Promise<MotanUser | null> {
  const supabase = createAccessTokenClient(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

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

/**
 * Validates that an authenticated user currently exists.
 */
export async function requireUser(): Promise<MotanUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("[@motanos/auth] Authenticated user required.");
  }
  return user;
}

export async function requireUserFromAccessToken(accessToken: string): Promise<MotanUser> {
  const user = await getCurrentUserFromAccessToken(accessToken);
  if (!user) {
    throw new Error("[@motanos/auth] Authenticated user required.");
  }
  return user;
}
