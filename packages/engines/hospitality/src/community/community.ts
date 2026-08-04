/**
 * Hospitality Community — community belonging to a hospitality business.
 * Foundation only: Person → Hospitality relation → Community (existence).
 *
 * @see DEC-HOSPITALITY-COMMUNITY-CONTEXT-001
 */

/** Internal community kinds — hospitality-scoped groups, not horizontal social products. */
export const COMMUNITY_KINDS = {
  /** Member-based community (e.g. club associates). */
  Member: "community.member",
  /** Club / private-venue community. */
  Club: "community.club",
  /** Restaurant / venue community. */
  Restaurant: "community.restaurant",
  /** Interaction-oriented community. */
  Social: "community.social",
  /** Internal MotanOS hospitality community. */
  Internal: "community.internal",
} as const;

export type CommunityKind =
  (typeof COMMUNITY_KINDS)[keyof typeof COMMUNITY_KINDS];

export const COMMUNITY_KIND_VALUES = Object.values(
  COMMUNITY_KINDS,
) as readonly CommunityKind[];

/** Community lifecycle status (existence labels only — no engagement engine). */
export const COMMUNITY_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type CommunityStatus =
  (typeof COMMUNITY_STATUSES)[keyof typeof COMMUNITY_STATUSES];

export const COMMUNITY_STATUS_VALUES = Object.values(
  COMMUNITY_STATUSES,
) as readonly CommunityStatus[];

/**
 * Opaque hospitality community — group existence within one business only.
 * No gatherings, proposals, badges, scores, ladders, or timeline payloads.
 */
export type HospitalityCommunity = {
  /** Opaque unique community reference. */
  communityReference: string;
  /** Internal community kind. */
  communityKind: CommunityKind;
  /** Community status. */
  communityStatus: CommunityStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque organization pointer when known. */
  organizationReference?: string;
  /** Opaque membership pointer when known. */
  membershipReference?: string;
  /** Opaque parent community pointer when nested. */
  parentCommunityReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future community adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface CommunityPort {
  createCommunity(
    input: CreateCommunityInput,
  ): Promise<HospitalityCommunity>;
  resolveCommunity(
    community: HospitalityCommunity,
  ): Promise<HospitalityCommunity>;
}

export type CreateCommunityInput = {
  communityKind: CommunityKind;
  communityStatus?: CommunityStatus;
  communityReference?: string;
  hospitalityReference?: string;
  contextReference?: string;
  organizationReference?: string;
  membershipReference?: string;
  parentCommunityReference?: string;
  metadata?: Record<string, unknown>;
};

export function isCommunityKind(value: string): value is CommunityKind {
  return (COMMUNITY_KIND_VALUES as readonly string[]).includes(value);
}

export function isCommunityStatus(value: string): value is CommunityStatus {
  return (COMMUNITY_STATUS_VALUES as readonly string[]).includes(value);
}

function optionalOpaqueOk(
  candidate: Record<string, unknown>,
  key: string,
): boolean {
  const raw = candidate[key];
  return (
    raw === undefined || (typeof raw === "string" && raw.length > 0)
  );
}

export function isHospitalityCommunity(
  value: unknown,
): value is HospitalityCommunity {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.communityReference === "string" &&
    candidate.communityReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "organizationReference") &&
    optionalOpaqueOk(candidate, "membershipReference") &&
    optionalOpaqueOk(candidate, "parentCommunityReference") &&
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
