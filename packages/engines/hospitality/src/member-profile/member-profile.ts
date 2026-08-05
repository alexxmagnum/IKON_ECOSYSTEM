/**
 * Hospitality Member Profile — relationship of a person with one hospitality business.
 * Bridge only: Actor → Member Profile → Engagement → Community → future Loyalty.
 *
 * Distinct from Actor / Identity (global person) and from Loyalty / CRM.
 *
 * @see DEC-HOSPITALITY-MEMBER-PROFILE-CONTEXT-001
 */

/** Internal member-profile kinds — business relationship modes, not global identity. */
export const MEMBER_PROFILE_KINDS = {
  /** General profile within the hospitality business. */
  Profile: "member.profile",
  /** Invited guest. */
  Guest: "member.guest",
  /** Regular customer. */
  Customer: "member.customer",
  /** Club member / partner. */
  Club: "member.club",
  /** Internal MotanOS hospitality member profile. */
  Internal: "member.internal",
} as const;

export type MemberProfileKind =
  (typeof MEMBER_PROFILE_KINDS)[keyof typeof MEMBER_PROFILE_KINDS];

export const MEMBER_PROFILE_KIND_VALUES = Object.values(
  MEMBER_PROFILE_KINDS,
) as readonly MemberProfileKind[];

/** Member-profile lifecycle status (existence labels only — no loyalty payloads). */
export const MEMBER_PROFILE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type MemberProfileStatus =
  (typeof MEMBER_PROFILE_STATUSES)[keyof typeof MEMBER_PROFILE_STATUSES];

export const MEMBER_PROFILE_STATUS_VALUES = Object.values(
  MEMBER_PROFILE_STATUSES,
) as readonly MemberProfileStatus[];

/**
 * Opaque hospitality member profile — business-relationship existence only.
 * Links an Actor to one Hospitality without copying personal identity fields.
 * No personal contact fields, loyalty metrics, or CRM payloads.
 */
export type HospitalityMemberProfile = {
  /** Opaque unique member reference. */
  memberReference: string;
  /** Internal member-profile kind. */
  memberKind: MemberProfileKind;
  /** Member-profile status. */
  memberStatus: MemberProfileStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque actor pointer when known (global identity lives on Actor). */
  actorReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque engagement pointer when known. */
  engagementReference?: string;
  /** Opaque participation pointer when known. */
  participationReference?: string;
  /** Opaque visit pointer when known. */
  visitReference?: string;
  /** Opaque parent member pointer when nested. */
  parentMemberReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future member-profile adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface MemberProfilePort {
  createMemberProfile(
    input: CreateMemberProfileInput,
  ): Promise<HospitalityMemberProfile>;
  resolveMemberProfile(
    member: HospitalityMemberProfile,
  ): Promise<HospitalityMemberProfile>;
}

export type CreateMemberProfileInput = {
  memberKind: MemberProfileKind;
  memberStatus?: MemberProfileStatus;
  memberReference?: string;
  hospitalityReference?: string;
  actorReference?: string;
  communityReference?: string;
  engagementReference?: string;
  participationReference?: string;
  visitReference?: string;
  parentMemberReference?: string;
  metadata?: Record<string, unknown>;
};

export function isMemberProfileKind(
  value: string,
): value is MemberProfileKind {
  return (MEMBER_PROFILE_KIND_VALUES as readonly string[]).includes(value);
}

export function isMemberProfileStatus(
  value: string,
): value is MemberProfileStatus {
  return (MEMBER_PROFILE_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityMemberProfile(
  value: unknown,
): value is HospitalityMemberProfile {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.memberReference === "string" &&
    candidate.memberReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "engagementReference") &&
    optionalOpaqueOk(candidate, "participationReference") &&
    optionalOpaqueOk(candidate, "visitReference") &&
    optionalOpaqueOk(candidate, "parentMemberReference") &&
    typeof candidate.memberKind === "string" &&
    isMemberProfileKind(candidate.memberKind) &&
    typeof candidate.memberStatus === "string" &&
    isMemberProfileStatus(candidate.memberStatus)
  );
}

export function isMemberProfilePort(
  value: unknown,
): value is MemberProfilePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as MemberProfilePort).createMemberProfile === "function" &&
    typeof (value as MemberProfilePort).resolveMemberProfile === "function"
  );
}
