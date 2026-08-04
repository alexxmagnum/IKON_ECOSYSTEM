/**
 * @motanos/tenant — Tenant Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/tenant
 *
 * Tenant = tenant existence for the multi-tenant platform root.
 * Must not depend on person packages, belonging packages, economic packages,
 * settings runners, or persistence vendors.
 *
 * @see DEC-TENANT-BOUNDARY-001
 */

export const TENANT_BOUNDARY = "@motanos/tenant" as const;

export type {
  CreateTenantInput,
  CreateTenantOptions,
  Tenant,
  TenantKind,
  TenantPort,
  TenantStatus,
} from "./tenants";
export {
  TENANT_KINDS,
  TENANT_KIND_VALUES,
  TENANT_STATUSES,
  TENANT_STATUS_VALUES,
  createTenant,
  isTenant,
  isTenantKind,
  isTenantPort,
  isTenantStatus,
  resetTenantReferenceSequence,
} from "./tenants";
