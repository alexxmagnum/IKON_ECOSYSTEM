import { z } from "zod";

/**
 * Client-safe environment variables only.
 * Never include service-role or database credentials here (ADR-002 / DEC-005).
 *
 * Empty strings are allowed so local bootstrap can run without filled secrets.
 */
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function getPublicEnv(
  source: Record<string, string | undefined> = process.env,
): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: source.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

/** True when public Supabase vars are present and non-empty. */
export function hasPublicSupabaseEnv(env: PublicEnv = getPublicEnv()): boolean {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() && env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}
