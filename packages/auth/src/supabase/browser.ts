import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv, hasPublicSupabaseEnv } from "@motanos/config";

let browserClient: SupabaseClient | null = null;

/**
 * Browser / client Supabase client using the anon key only.
 * Never uses the service role key.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

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

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
