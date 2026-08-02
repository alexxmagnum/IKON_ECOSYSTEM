/**
 * Community Engine Boundary — relations, belonging, and social participation
 * (not Identity / Auth / Membership / Booking / Payment / Experience).
 *
 * @see DEC-COMMUNITY-BOUNDARY-001
 */

/** Internal community kinds — not identity roles or membership tiers. */
export const COMMUNITY_KINDS = {
  /** Primary club community. */
  Club: "community.club",
  /** Interest / schedule group. */
  Group: "community.group",
  /** Competition or activity team. */
  Team: "community.team",
  /** Small closed circle. */
  Circle: "community.circle",
  /** Broad network community. */
  Network: "community.network",
  /**
   * Community initiated by a Community system operation.
   * Not a technical infrastructure error.
   */
  Operational: "community.operational",
} as const;

export type CommunityKind =
  (typeof COMMUNITY_KINDS)[keyof typeof COMMUNITY_KINDS];

export const COMMUNITY_KIND_VALUES = Object.values(
  COMMUNITY_KINDS,
) as readonly CommunityKind[];

/** Community definition status — not membership or auth state. */
export const COMMUNITY_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type CommunityStatus =
  (typeof COMMUNITY_STATUSES)[keyof typeof COMMUNITY_STATUSES];

export const COMMUNITY_STATUS_VALUES = Object.values(
  COMMUNITY_STATUSES,
) as readonly CommunityStatus[];

/**
 * Opaque community definition — belonging and participation context.
 * No passwords, tokens, credentials, PII, or auth data.
 */
export interface Community {
  /** Opaque unique community reference. */
  communityReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal community kind. */
  communityKind: CommunityKind;
  /** Community definition status. */
  communityStatus: CommunityStatus;
  /** Opaque display-name pointer — not live localized copy. */
  nameReference?: string;
  /** Opaque description pointer — not live localized copy. */
  descriptionReference?: string;
  /** Opaque owner when known — not an identity profile. */
  ownerReference?: string;
  /** Opaque actor when known — not a live user session. */
  actorReference?: string;
  /** Opaque parent community (hierarchy) — not a live graph query. */
  parentCommunityReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future community adapters (Runtime).
 * Not wired in this foundation — no members, chat, or invites.
 */
export interface CommunityPort {
  createCommunity(input: CreateCommunityInput): Promise<Community>;
  resolveCommunity(community: Community): Promise<Community>;
}

export interface CreateCommunityInput {
  tenantReference: string;
  communityKind: CommunityKind;
  communityStatus?: CommunityStatus;
  communityReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  ownerReference?: string;
  actorReference?: string;
  parentCommunityReference?: string;
  metadata?: Record<string, unknown>;
}

export function isCommunityKind(value: string): value is CommunityKind {
  return (COMMUNITY_KIND_VALUES as readonly string[]).includes(value);
}

export function isCommunityStatus(value: string): value is CommunityStatus {
  return (COMMUNITY_STATUS_VALUES as readonly string[]).includes(value);
}

export function isCommunity(value: unknown): value is Community {
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
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const parentOk =
    candidate.parentCommunityReference === undefined ||
    (typeof candidate.parentCommunityReference === "string" &&
      candidate.parentCommunityReference.length > 0);
  return (
    typeof candidate.communityReference === "string" &&
    candidate.communityReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    ownerOk &&
    actorOk &&
    parentOk &&
    typeof candidate.communityKind === "string" &&
    isCommunityKind(candidate.communityKind) &&
    typeof candidate.communityStatus === "string" &&
    isCommunityStatus(candidate.communityStatus)
  );
}

export function isCommunityPort(value: unknown): value is CommunityPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as CommunityPort).createCommunity === "function" &&
    typeof (value as CommunityPort).resolveCommunity === "function"
  );
}
