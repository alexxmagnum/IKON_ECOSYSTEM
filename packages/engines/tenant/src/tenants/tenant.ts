/**
 * Tenant Engine Boundary — organization / multi-tenant root context / lifecycle
 * (not people, sign-in, access control, invoicing, or physical resources).
 *
 * @see DEC-TENANT-BOUNDARY-001
 */

/** Internal tenant kinds — not marketplace or vendor catalogs. */
export const TENANT_KINDS = {
  /** Client organization. */
  Organization: "tenant.organization",
  /** Individual business. */
  Business: "tenant.business",
  /** Club context (e.g. IKON). */
  Club: "tenant.club",
  /** Hospitality venue. */
  Restaurant: "tenant.restaurant",
  /** Internal MotanOS platform tenant. */
  Platform: "tenant.platform",
  /**
   * Tenant initiated by a Tenant system operation.
   * Not a technical infrastructure error.
   */
  Operational: "tenant.operational",
} as const;

export type TenantKind = (typeof TENANT_KINDS)[keyof typeof TENANT_KINDS];

export const TENANT_KIND_VALUES = Object.values(
  TENANT_KINDS,
) as readonly TenantKind[];

/** Tenant lifecycle status — not invoicing or access-control state. */
export const TENANT_STATUSES = {
  Draft: "draft",
  Active: "active",
  Suspended: "suspended",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type TenantStatus =
  (typeof TENANT_STATUSES)[keyof typeof TENANT_STATUSES];

export const TENANT_STATUS_VALUES = Object.values(
  TENANT_STATUSES,
) as readonly TenantStatus[];

/**
 * Opaque tenant definition — organizational root context only.
 * No credential material or access catalogs.
 */
export interface Tenant {
  /** Opaque unique tenant reference — multi-tenant root. */
  tenantReference: string;
  /** Internal tenant kind. */
  tenantKind: TenantKind;
  /** Tenant lifecycle status. */
  tenantStatus: TenantStatus;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque owner pointer when known — not a live identity profile. */
  ownerReference?: string;
  /** Opaque parent tenant pointer when nested. */
  parentTenantReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future tenant adapters (Runtime).
 * Not wired in this foundation — no people invites, access assignment,
 * or invoicing activation.
 */
export interface TenantPort {
  createTenant(input: CreateTenantInput): Promise<Tenant>;
  resolveTenant(tenant: Tenant): Promise<Tenant>;
}

export interface CreateTenantInput {
  tenantKind: TenantKind;
  tenantStatus?: TenantStatus;
  tenantReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  ownerReference?: string;
  parentTenantReference?: string;
  metadata?: Record<string, unknown>;
}

export function isTenantKind(value: string): value is TenantKind {
  return (TENANT_KIND_VALUES as readonly string[]).includes(value);
}

export function isTenantStatus(value: string): value is TenantStatus {
  return (TENANT_STATUS_VALUES as readonly string[]).includes(value);
}

export function isTenant(value: unknown): value is Tenant {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const nameOk =
    candidate.nameReference === undefined ||
    (typeof candidate.nameReference === "string" &&
      candidate.nameReference.length > 0);
  const descriptionOk =
    candidate.descriptionReference === undefined ||
    (typeof candidate.descriptionReference === "string" &&
      candidate.descriptionReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  const parentOk =
    candidate.parentTenantReference === undefined ||
    (typeof candidate.parentTenantReference === "string" &&
      candidate.parentTenantReference.length > 0);
  return (
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    ownerOk &&
    parentOk &&
    typeof candidate.tenantKind === "string" &&
    isTenantKind(candidate.tenantKind) &&
    typeof candidate.tenantStatus === "string" &&
    isTenantStatus(candidate.tenantStatus)
  );
}

export function isTenantPort(value: unknown): value is TenantPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as TenantPort).createTenant === "function" &&
    typeof (value as TenantPort).resolveTenant === "function"
  );
}
