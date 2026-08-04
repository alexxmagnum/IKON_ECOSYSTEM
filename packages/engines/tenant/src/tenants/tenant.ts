/**
 * Tenant Boundary — tenant existence / multi-tenant root context
 * (not people, sign-in, access control, economic records, or physical resources).
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
  /** Internal MotanOS platform tenant. */
  Platform: "tenant.platform",
  /** Internal operational tenant. */
  Internal: "tenant.internal",
  /**
   * Tenant initiated by a Tenant system operation.
   * Not a technical platform problem.
   */
  Operational: "tenant.operational",
} as const;

export type TenantKind = (typeof TENANT_KINDS)[keyof typeof TENANT_KINDS];

export const TENANT_KIND_VALUES = Object.values(
  TENANT_KINDS,
) as readonly TenantKind[];

/** Tenant lifecycle status — not economic or access-control state. */
export const TENANT_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type TenantStatus =
  (typeof TENANT_STATUSES)[keyof typeof TENANT_STATUSES];

export const TENANT_STATUS_VALUES = Object.values(
  TENANT_STATUSES,
) as readonly TenantStatus[];

/**
 * Opaque tenant — tenant existence / organizational root only.
 * No credential material or access catalogs.
 */
export type Tenant = {
  /** Opaque unique tenant reference — multi-tenant root. */
  tenantReference: string;
  /** Internal tenant kind. */
  tenantKind: TenantKind;
  /** Tenant lifecycle status. */
  tenantStatus: TenantStatus;
  /** Opaque organization pointer when known. */
  organizationReference?: string;
  /** Opaque owner pointer when known — not a live person profile. */
  ownerReference?: string;
  /** Opaque parent tenant pointer when nested. */
  parentTenantReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque region pointer when known. */
  regionReference?: string;
  /** Opaque plan pointer when known — not a live commerce catalog. */
  planReference?: string;
  /** Opaque settings pointer when known. */
  configurationReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future tenant adapters.
 * Not wired in this foundation — no people invites, access assignment,
 * or economic activation.
 */
export interface TenantPort {
  createTenant(input: CreateTenantInput): Promise<Tenant>;
  resolveTenant(tenant: Tenant): Promise<Tenant>;
}

export type CreateTenantInput = {
  tenantKind: TenantKind;
  tenantStatus?: TenantStatus;
  tenantReference?: string;
  organizationReference?: string;
  ownerReference?: string;
  parentTenantReference?: string;
  contextReference?: string;
  regionReference?: string;
  planReference?: string;
  configurationReference?: string;
  metadata?: Record<string, unknown>;
};

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
  const organizationOk =
    candidate.organizationReference === undefined ||
    (typeof candidate.organizationReference === "string" &&
      candidate.organizationReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  const parentOk =
    candidate.parentTenantReference === undefined ||
    (typeof candidate.parentTenantReference === "string" &&
      candidate.parentTenantReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const regionOk =
    candidate.regionReference === undefined ||
    (typeof candidate.regionReference === "string" &&
      candidate.regionReference.length > 0);
  const planOk =
    candidate.planReference === undefined ||
    (typeof candidate.planReference === "string" &&
      candidate.planReference.length > 0);
  const settingsOk =
    candidate.configurationReference === undefined ||
    (typeof candidate.configurationReference === "string" &&
      candidate.configurationReference.length > 0);
  return (
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    organizationOk &&
    ownerOk &&
    parentOk &&
    contextOk &&
    regionOk &&
    planOk &&
    settingsOk &&
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
