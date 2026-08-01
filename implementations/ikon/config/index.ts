/**
 * IKON experience configuration (Single-Tenant v1).
 * No club_id / tenant_id (DEC-001).
 * No auth/database/permissions.
 */
export const IKON_CONFIG = {
  implementationId: "ikon-sports-lounge",
  tenancy: "single-tenant-v1",
  experience: {
    defaultLocale: "es-ES",
    showFoundationBadge: true,
  },
} as const;

export type IkonConfig = typeof IKON_CONFIG;
