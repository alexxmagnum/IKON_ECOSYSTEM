/**
 * Membership Engine Boundary — relation between an identity and an organization
 * (not Identity / Auth / Commerce charging / plans / RBAC).
 *
 * @see DEC-MEMBERSHIP-BOUNDARY-001
 * @see DEC-IDENTITY-BOUNDARY-001
 */

/** Internal membership kinds — not roles, plans, or commerce SKUs. */
export const MEMBERSHIP_KINDS = {
  /** Club / organization member. */
  Member: "membership.member",
  /** League or competition player. */
  Player: "membership.player",
  /** Partner organization relation. */
  Partner: "membership.partner",
  /** Staff relation to the organization. */
  Staff: "membership.staff",
  /** Premium / VIP membership relation. */
  Vip: "membership.vip",
  /**
   * Membership initiated by a Membership system operation.
   * Not a technical infrastructure error.
   */
  Operational: "membership.operational",
} as const;

export type MembershipKind =
  (typeof MEMBERSHIP_KINDS)[keyof typeof MEMBERSHIP_KINDS];

export const MEMBERSHIP_KIND_VALUES = Object.values(
  MEMBERSHIP_KINDS,
) as readonly MembershipKind[];

/** Membership relation status — not commerce or authorization state. */
export const MEMBERSHIP_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Expired: "expired",
  Cancelled: "cancelled",
} as const;

export type MembershipStatus =
  (typeof MEMBERSHIP_STATUSES)[keyof typeof MEMBERSHIP_STATUSES];

export const MEMBERSHIP_STATUS_VALUES = Object.values(
  MEMBERSHIP_STATUSES,
) as readonly MembershipStatus[];

/**
 * Opaque membership relation — identity belongs to an organization/tenant.
 * No secrets, credential material, or commerce charge fields.
 */
export interface Membership {
  /** Opaque unique membership reference. */
  membershipReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Opaque identity this membership attaches to — required. */
  identityReference: string;
  /** Internal membership kind. */
  membershipKind: MembershipKind;
  /** Membership relation status. */
  membershipStatus: MembershipStatus;
  /** Opaque organization pointer when distinct from tenant. */
  organizationReference?: string;
  /** Opaque start pointer — not a live calendar datetime. */
  startReference?: string;
  /** Opaque end pointer — not a live calendar datetime. */
  endReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future membership adapters (Runtime).
 * Not wired in this foundation — no charging, plans, or permission assignment.
 */
export interface MembershipPort {
  createMembership(input: CreateMembershipInput): Promise<Membership>;
  resolveMembership(membership: Membership): Promise<Membership>;
}

export interface CreateMembershipInput {
  tenantReference: string;
  identityReference: string;
  membershipKind: MembershipKind;
  membershipStatus?: MembershipStatus;
  membershipReference?: string;
  organizationReference?: string;
  startReference?: string;
  endReference?: string;
  metadata?: Record<string, unknown>;
}

export function isMembershipKind(value: string): value is MembershipKind {
  return (MEMBERSHIP_KIND_VALUES as readonly string[]).includes(value);
}

export function isMembershipStatus(value: string): value is MembershipStatus {
  return (MEMBERSHIP_STATUS_VALUES as readonly string[]).includes(value);
}

export function isMembership(value: unknown): value is Membership {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const organizationOk =
    candidate.organizationReference === undefined ||
    (typeof candidate.organizationReference === "string" &&
      candidate.organizationReference.length > 0);
  const startOk =
    candidate.startReference === undefined ||
    (typeof candidate.startReference === "string" &&
      candidate.startReference.length > 0);
  const endOk =
    candidate.endReference === undefined ||
    (typeof candidate.endReference === "string" &&
      candidate.endReference.length > 0);
  return (
    typeof candidate.membershipReference === "string" &&
    candidate.membershipReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.identityReference === "string" &&
    candidate.identityReference.length > 0 &&
    organizationOk &&
    startOk &&
    endOk &&
    typeof candidate.membershipKind === "string" &&
    isMembershipKind(candidate.membershipKind) &&
    typeof candidate.membershipStatus === "string" &&
    isMembershipStatus(candidate.membershipStatus)
  );
}

export function isMembershipPort(value: unknown): value is MembershipPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as MembershipPort).createMembership === "function" &&
    typeof (value as MembershipPort).resolveMembership === "function"
  );
}
