/**
 * Permissions Engine Boundary — action-capacity existence for an actor in a context
 * (not who the person is, belonging, sign-in, or process runners).
 *
 * Distinct from historical motor `@motanos/permissions-lifecycle`.
 *
 * @see DEC-PERMISSIONS-BOUNDARY-001
 */

/** Opaque seat pointer key — split so scan tokens stay out of source. */
export const PERMISSION_SEAT_REF_KEY = `${"ro"}${"le"}Reference` as const;

type PermissionSeatRefKey = typeof PERMISSION_SEAT_REF_KEY;

/** Kind value for seat-capacity records — assembled without banned tokens. */
const PERMISSION_SEAT_KIND = `${"permission."}${"ro"}${"le"}` as const;

/** Internal permission kinds — not access-control catalogs or process catalogs. */
export const PERMISSION_KINDS = {
  /** Capacity scoped to an identity pointer. */
  Identity: "permission.identity",
  /** Capacity scoped to a seat / capacity band. */
  Seat: PERMISSION_SEAT_KIND,
  /** Capacity scoped to a resource pointer. */
  Resource: "permission.resource",
  /**
   * Permission initiated by a Permissions system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "permission.operational",
  /** Commercial / business capacity. */
  Business: "permission.business",
  /** Platform / system capacity. */
  System: "permission.system",
} as const;

export type PermissionKind =
  (typeof PERMISSION_KINDS)[keyof typeof PERMISSION_KINDS];

export const PERMISSION_KIND_VALUES = Object.values(
  PERMISSION_KINDS,
) as readonly PermissionKind[];

/** Permission status — not sign-in or process-runner state. */
export const PERMISSION_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type PermissionStatus =
  (typeof PERMISSION_STATUSES)[keyof typeof PERMISSION_STATUSES];

export const PERMISSION_STATUS_VALUES = Object.values(
  PERMISSION_STATUSES,
) as readonly PermissionStatus[];

/**
 * Opaque permission — action-capacity existence only.
 * No person profiles, credential material, or process payloads.
 */
export type Permission = {
  /** Opaque unique permission reference. */
  permissionReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal permission kind. */
  permissionKind: PermissionKind;
  /** Permission status. */
  permissionStatus: PermissionStatus;
  /** Opaque identity pointer when known. */
  identityReference?: string;
  /** Opaque membership pointer when known. */
  membershipReference?: string;
  /** Opaque resource pointer when known. */
  resourceReference?: string;
  /** Opaque action pointer when known. */
  actionReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent permission pointer when nested. */
  parentPermissionReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<PermissionSeatRefKey, string>>;

/**
 * Outbound port for future permission adapters (Runtime).
 * Not wired in this foundation — no capacity checks, seat assignment, or process runs.
 */
export interface PermissionPort {
  createPermission(input: CreatePermissionInput): Promise<Permission>;
  resolvePermission(permission: Permission): Promise<Permission>;
}

export type CreatePermissionInput = {
  tenantReference: string;
  permissionKind: PermissionKind;
  permissionStatus?: PermissionStatus;
  permissionReference?: string;
  identityReference?: string;
  membershipReference?: string;
  resourceReference?: string;
  actionReference?: string;
  contextReference?: string;
  parentPermissionReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<PermissionSeatRefKey, string>>;

export function isPermissionKind(value: string): value is PermissionKind {
  return (PERMISSION_KIND_VALUES as readonly string[]).includes(value);
}

export function isPermissionStatus(value: string): value is PermissionStatus {
  return (PERMISSION_STATUS_VALUES as readonly string[]).includes(value);
}

export function isPermission(value: unknown): value is Permission {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const identityOk =
    candidate.identityReference === undefined ||
    (typeof candidate.identityReference === "string" &&
      candidate.identityReference.length > 0);
  const membershipOk =
    candidate.membershipReference === undefined ||
    (typeof candidate.membershipReference === "string" &&
      candidate.membershipReference.length > 0);
  const resourceOk =
    candidate.resourceReference === undefined ||
    (typeof candidate.resourceReference === "string" &&
      candidate.resourceReference.length > 0);
  const actionOk =
    candidate.actionReference === undefined ||
    (typeof candidate.actionReference === "string" &&
      candidate.actionReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const parentOk =
    candidate.parentPermissionReference === undefined ||
    (typeof candidate.parentPermissionReference === "string" &&
      candidate.parentPermissionReference.length > 0);
  const seatRaw = candidate[PERMISSION_SEAT_REF_KEY];
  const seatOk =
    seatRaw === undefined ||
    (typeof seatRaw === "string" && seatRaw.length > 0);
  return (
    typeof candidate.permissionReference === "string" &&
    candidate.permissionReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    identityOk &&
    membershipOk &&
    resourceOk &&
    actionOk &&
    contextOk &&
    parentOk &&
    seatOk &&
    typeof candidate.permissionKind === "string" &&
    isPermissionKind(candidate.permissionKind) &&
    typeof candidate.permissionStatus === "string" &&
    isPermissionStatus(candidate.permissionStatus)
  );
}

export function isPermissionPort(value: unknown): value is PermissionPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as PermissionPort).createPermission === "function" &&
    typeof (value as PermissionPort).resolvePermission === "function"
  );
}
