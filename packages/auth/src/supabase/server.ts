import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv, hasPublicSupabaseEnv } from "@motanos/config";
import { getServerEnv, requireServiceRoleKey } from "@motanos/config/server";

/**
 * Server Supabase client with anon key (user-scoped operations).
 */
export function createServerSupabaseClient(): SupabaseClient {
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
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Privileged server client. Server-only. Never import from client components.
 */
export function createServiceRoleSupabaseClient(): SupabaseClient {
  const env = getServerEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("[@motanos/auth] Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  const serviceRoleKey = requireServiceRoleKey(env);

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
