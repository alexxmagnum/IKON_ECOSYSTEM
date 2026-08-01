/**
 * MotanOS Phase 3 — Identity Runtime smoke validation (no UI).
 *
 * Checks:
 * 1) public/server env shape
 * 2) permission helpers
 * 3) optional database catalog access when DATABASE_URL is set
 * 4) optional auth helper wiring when public Supabase env is set
 *
 * Exits 0 on skip (env not configured) or successful checks.
 */
import { getPublicEnv, hasPublicSupabaseEnv } from "@motanos/config";
import { getServerEnv } from "@motanos/config/server";
import {
  OFFICIAL_ROLES,
  filterOfficialRoles,
  hasRole,
  isPlatformAdmin,
} from "@motanos/permissions";
import { hasDatabaseUrl, getDatabase, roles, permissions } from "@motanos/database";
import { createServerSupabaseClient } from "@motanos/auth/server";

async function main() {
  const publicEnv = getPublicEnv();
  const serverEnv = getServerEnv();

  console.log("[identity-smoke] config OK");
  console.log(
    `[identity-smoke] public supabase configured: ${hasPublicSupabaseEnv(publicEnv)}`,
  );
  console.log(`[identity-smoke] database url configured: ${Boolean(serverEnv.DATABASE_URL)}`);
  console.log(
    `[identity-smoke] service role name present: ${Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY)}`,
  );

  const sampleRoles = filterOfficialRoles(["Member", "not-a-role", "Platform Admin"]);
  if (!hasRole(sampleRoles, "Member") || !isPlatformAdmin(["Platform Admin"])) {
    throw new Error("[identity-smoke] permission helpers failed");
  }
  console.log(`[identity-smoke] permissions OK (${OFFICIAL_ROLES.length} DEC-002 roles)`);

  if (hasPublicSupabaseEnv(publicEnv)) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(`[identity-smoke] auth session probe failed: ${error.message}`);
    }
    console.log("[identity-smoke] auth runtime reachable (getSession)");
  } else {
    console.log("[identity-smoke] auth runtime SKIPPED (public supabase env empty)");
  }

  if (hasDatabaseUrl()) {
    const db = getDatabase();
    const roleRows = await db.select({ name: roles.name }).from(roles);
    const permissionRows = await db.select({ key: permissions.key }).from(permissions);
    console.log(
      `[identity-smoke] database OK (roles=${roleRows.length}, permissions=${permissionRows.length})`,
    );
  } else {
    console.log("[identity-smoke] database SKIPPED (DATABASE_URL empty)");
  }

  console.log("[identity-smoke] PASS");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
