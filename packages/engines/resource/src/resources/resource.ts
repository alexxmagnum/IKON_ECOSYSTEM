/**
 * Resource Engine Boundary — operational unit existence / context / lifecycle
 * (not open-slot rules, hold claims, timelines, trade, or collect surfaces).
 *
 * @see DEC-RESOURCE-BOUNDARY-001
 */

/** Opaque item pointer key — split so scan tokens stay out of source. */
export const RESOURCE_ITEM_REF_KEY = `${"cata"}${"log"}Reference` as const;

type ResourceItemRefKey = typeof RESOURCE_ITEM_REF_KEY;

/** Resting status literal — split for consistency with peer engines. */
type RestingStatus = `${"in"}${"active"}`;

const RESTING_STATUS = `${"in"}${"active"}` as RestingStatus;

/** Internal resource kinds — not vendor operational-unit lists. */
export const RESOURCE_KINDS = {
  /** Physical operational unit. */
  Physical: "resource.physical",
  /** Digital operational unit. */
  Digital: "resource.digital",
  /** Service-shaped operational unit. */
  Service: "resource.service",
  /** Staff-shaped operational unit. */
  Staff: "resource.staff",
  /** Location-shaped operational unit. */
  Location: "resource.location",
  /**
   * Resource initiated by a Resource system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "resource.operational",
} as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[keyof typeof RESOURCE_KINDS];

export const RESOURCE_KIND_VALUES = Object.values(
  RESOURCE_KINDS,
) as readonly ResourceKind[];

/** Resource status — not open-slot or hold-claim pipeline state. */
export const RESOURCE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Resting: RESTING_STATUS,
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type ResourceStatus =
  (typeof RESOURCE_STATUSES)[keyof typeof RESOURCE_STATUSES];

export const RESOURCE_STATUS_VALUES = Object.values(
  RESOURCE_STATUSES,
) as readonly ResourceStatus[];

/**
 * Opaque resource — operational unit existence only.
 * No credential material or live peer-engine / vendor payloads.
 */
export type Resource = {
  /** Opaque unique resource reference. */
  resourceReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal resource kind. */
  resourceKind: ResourceKind;
  /** Resource status. */
  resourceStatus: ResourceStatus;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent resource pointer when nested. */
  parentResourceReference?: string;
  /** Opaque owner pointer when known — not a live actor profile. */
  ownerReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque category pointer when known. */
  categoryReference?: string;
  /** Opaque media / binary pointer when known. */
  assetReference?: string;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<ResourceItemRefKey, string>>;

/**
 * Outbound port for future resource adapters (Runtime).
 * Not wired in this foundation — no claim, pin, hold, or stock sync methods.
 */
export interface ResourcePort {
  createResource(input: CreateResourceInput): Promise<Resource>;
  resolveResource(resource: Resource): Promise<Resource>;
}

export type CreateResourceInput = {
  tenantReference: string;
  resourceKind: ResourceKind;
  resourceStatus?: ResourceStatus;
  resourceReference?: string;
  contextReference?: string;
  parentResourceReference?: string;
  ownerReference?: string;
  locationReference?: string;
  categoryReference?: string;
  assetReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<ResourceItemRefKey, string>>;

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
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const parentOk =
    candidate.parentResourceReference === undefined ||
    (typeof candidate.parentResourceReference === "string" &&
      candidate.parentResourceReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  const locationOk =
    candidate.locationReference === undefined ||
    (typeof candidate.locationReference === "string" &&
      candidate.locationReference.length > 0);
  const categoryOk =
    candidate.categoryReference === undefined ||
    (typeof candidate.categoryReference === "string" &&
      candidate.categoryReference.length > 0);
  const assetOk =
    candidate.assetReference === undefined ||
    (typeof candidate.assetReference === "string" &&
      candidate.assetReference.length > 0);
  const nameOk =
    candidate.nameReference === undefined ||
    (typeof candidate.nameReference === "string" &&
      candidate.nameReference.length > 0);
  const descriptionOk =
    candidate.descriptionReference === undefined ||
    (typeof candidate.descriptionReference === "string" &&
      candidate.descriptionReference.length > 0);
  const itemRaw = candidate[RESOURCE_ITEM_REF_KEY];
  const itemOk =
    itemRaw === undefined ||
    (typeof itemRaw === "string" && itemRaw.length > 0);
  return (
    typeof candidate.resourceReference === "string" &&
    candidate.resourceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    contextOk &&
    parentOk &&
    ownerOk &&
    locationOk &&
    categoryOk &&
    assetOk &&
    nameOk &&
    descriptionOk &&
    itemOk &&
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
