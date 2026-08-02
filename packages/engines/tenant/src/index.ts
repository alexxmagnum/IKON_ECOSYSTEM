/**
 * @motanos/tenant — Tenant Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/tenant
 *
 * Tenant = organization that uses MotanOS; multi-tenant root context.
 * Identity owns people; Membership owns relations; Configuration owns values;
 * access control owns capabilities; invoicing owns commercial charging.
 *
 * Must not depend on identity, membership, commerce, payment,
 * configuration, access-control packages, or persistence vendors.
 *
 * @see DEC-TENANT-BOUNDARY-001
 */

export const TENANT_ENGINE = "@motanos/tenant" as const;

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
