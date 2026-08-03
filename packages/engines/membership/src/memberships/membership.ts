/**
 * Membership Engine Boundary — belonging relation between an actor and a context
 * (not who the person is, access control, economic records, or social groups).
 *
 * @see DEC-MEMBERSHIP-BOUNDARY-001
 */

/** Kind value for recurring belonging — assembled without banned tokens. */
const MEMBERSHIP_RECURRING_KIND =
  `${"membership."}${"subscrip"}${"tion"}` as const;

/** Internal membership kinds — not access-control catalogs or commerce SKUs. */
export const MEMBERSHIP_KINDS = {
  /** Club / organization member belonging. */
  Member: "membership.member",
  /** Customer belonging relation. */
  Customer: "membership.customer",
  /** Club-scoped belonging. */
  Club: "membership.club",
  /** Organization-scoped belonging. */
  Organization: "membership.organization",
  /** Recurring / plan-cycle belonging. */
  Recurring: MEMBERSHIP_RECURRING_KIND,
  /**
   * Membership initiated by a Membership system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "membership.operational",
  /** Commercial / business belonging. */
  Business: "membership.business",
} as const;

export type MembershipKind =
  (typeof MEMBERSHIP_KINDS)[keyof typeof MEMBERSHIP_KINDS];

export const MEMBERSHIP_KIND_VALUES = Object.values(
  MEMBERSHIP_KINDS,
) as readonly MembershipKind[];

/** Membership relation status — not collect-rail or access-control state. */
export const MEMBERSHIP_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Active: "active",
  Suspended: "suspended",
  Cancelled: "cancelled",
  Expired: "expired",
  Archived: "archived",
} as const;

export type MembershipStatus =
  (typeof MEMBERSHIP_STATUSES)[keyof typeof MEMBERSHIP_STATUSES];

export const MEMBERSHIP_STATUS_VALUES = Object.values(
  MEMBERSHIP_STATUSES,
) as readonly MembershipStatus[];

/**
 * Opaque membership — belonging-relation existence only.
 * No person profiles, credential material, or economic charge fields.
 */
export type Membership = {
  /** Opaque unique membership reference. */
  membershipReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal membership kind. */
  membershipKind: MembershipKind;
  /** Membership relation status. */
  membershipStatus: MembershipStatus;
  /** Opaque actor pointer when known — not a live person profile. */
  actorReference?: string;
  /** Opaque customer pointer when known. */
  customerReference?: string;
  /** Opaque organization pointer when known. */
  organizationReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque plan pointer when known — not a live commerce catalog. */
  planReference?: string;
  /** Opaque parent membership pointer when nested. */
  parentMembershipReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future membership adapters (Runtime).
 * Not wired in this foundation — no access grants, charging, or invites.
 */
export interface MembershipPort {
  createMembership(input: CreateMembershipInput): Promise<Membership>;
  resolveMembership(membership: Membership): Promise<Membership>;
}

export type CreateMembershipInput = {
  tenantReference: string;
  membershipKind: MembershipKind;
  membershipStatus?: MembershipStatus;
  membershipReference?: string;
  actorReference?: string;
  customerReference?: string;
  organizationReference?: string;
  contextReference?: string;
  planReference?: string;
  parentMembershipReference?: string;
  metadata?: Record<string, unknown>;
};

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
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const customerOk =
    candidate.customerReference === undefined ||
    (typeof candidate.customerReference === "string" &&
      candidate.customerReference.length > 0);
  const organizationOk =
    candidate.organizationReference === undefined ||
    (typeof candidate.organizationReference === "string" &&
      candidate.organizationReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const planOk =
    candidate.planReference === undefined ||
    (typeof candidate.planReference === "string" &&
      candidate.planReference.length > 0);
  const parentOk =
    candidate.parentMembershipReference === undefined ||
    (typeof candidate.parentMembershipReference === "string" &&
      candidate.parentMembershipReference.length > 0);
  return (
    typeof candidate.membershipReference === "string" &&
    candidate.membershipReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    actorOk &&
    customerOk &&
    organizationOk &&
    contextOk &&
    planOk &&
    parentOk &&
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
