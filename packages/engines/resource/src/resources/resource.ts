/**
 * Resource Engine Boundary — usable/reservable capacity definition
 * (not Booking / Availability / Experience / Payment).
 *
 * @see DEC-RESOURCE-BOUNDARY-001
 */

/** Internal resource kinds — not booking slots or inventory SKUs. */
export const RESOURCE_KINDS = {
  /** Sports / club complex. */
  Facility: "resource.facility",
  /** Restaurant table. */
  Table: "resource.table",
  /** Court (e.g. padel). */
  Court: "resource.court",
  /** Golf course. */
  Course: "resource.course",
  /** Event / meeting room. */
  Room: "resource.room",
  /** Generic usable space. */
  Space: "resource.space",
  /** Equipment asset. */
  Equipment: "resource.equipment",
  /**
   * Resource initiated by a Resource system operation.
   * Not a technical infrastructure error.
   */
  Operational: "resource.operational",
} as const;

export type ResourceKind =
  (typeof RESOURCE_KINDS)[keyof typeof RESOURCE_KINDS];

export const RESOURCE_KIND_VALUES = Object.values(
  RESOURCE_KINDS,
) as readonly ResourceKind[];

/** Resource lifecycle status — not availability or booking state. */
export const RESOURCE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Maintenance: "maintenance",
  Archived: "archived",
} as const;

export type ResourceStatus =
  (typeof RESOURCE_STATUSES)[keyof typeof RESOURCE_STATUSES];

export const RESOURCE_STATUS_VALUES = Object.values(
  RESOURCE_STATUSES,
) as readonly ResourceStatus[];

/**
 * Opaque resource definition — usable capacity that may later be booked.
 * No PII, payment data, or credentials.
 */
export interface Resource {
  /** Opaque unique resource reference. */
  resourceReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal resource kind. */
  resourceKind: ResourceKind;
  /** Resource definition status. */
  resourceStatus: ResourceStatus;
  /** Opaque display-name pointer — not live localized copy. */
  nameReference?: string;
  /** Opaque description pointer — not live localized copy. */
  descriptionReference?: string;
  /** Opaque parent resource (hierarchy) — not a live graph query. */
  parentResourceReference?: string;
  /** Opaque owner when known — not an identity profile. */
  ownerReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future resource adapters (Runtime).
 * Not wired in this foundation — no CRUD store or availability.
 */
export interface ResourcePort {
  createResource(input: CreateResourceInput): Promise<Resource>;
  resolveResource(resource: Resource): Promise<Resource>;
}

export interface CreateResourceInput {
  tenantReference: string;
  resourceKind: ResourceKind;
  resourceStatus?: ResourceStatus;
  resourceReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  parentResourceReference?: string;
  ownerReference?: string;
  metadata?: Record<string, unknown>;
}

export function isResourceKind(value: string): value is ResourceKind {
  return (RESOURCE_KIND_VALUES as readonly string[]).includes(value);
}

export function isResourceStatus(value: string): value is ResourceStatus {
  return (RESOURCE_STATUS_VALUES as readonly string[]).includes(value);
}

export function isResource(value: unknown): value is Resource {
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
  const parentOk =
    candidate.parentResourceReference === undefined ||
    (typeof candidate.parentResourceReference === "string" &&
      candidate.parentResourceReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  return (
    typeof candidate.resourceReference === "string" &&
    candidate.resourceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    parentOk &&
    ownerOk &&
    typeof candidate.resourceKind === "string" &&
    isResourceKind(candidate.resourceKind) &&
    typeof candidate.resourceStatus === "string" &&
    isResourceStatus(candidate.resourceStatus)
  );
}

export function isResourcePort(value: unknown): value is ResourcePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ResourcePort).createResource === "function" &&
    typeof (value as ResourcePort).resolveResource === "function"
  );
}
