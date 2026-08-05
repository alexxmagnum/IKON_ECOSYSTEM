import type {
  CreateMemberProfileInput,
  HospitalityMemberProfile,
  MemberProfileKind,
  MemberProfileStatus,
} from "./member-profile";
import {
  MEMBER_PROFILE_STATUSES,
  isMemberProfileKind,
  isMemberProfileStatus,
} from "./member-profile";

let memberProfileSequence = 0;

export interface CreateMemberProfileOptions {
  /**
   * When set, member profile may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityMemberProfile (in-memory — business relationship only).
 * Does not upgrade memberships, assign tiers, compute loyalty metrics, or grant incentives.
 */
export function createMemberProfile(
  input: CreateMemberProfileInput,
  options: CreateMemberProfileOptions = {},
): HospitalityMemberProfile {
  const hospitalityReference = input.hospitalityReference?.trim();
  const actorReference = input.actorReference?.trim();
  const communityReference = input.communityReference?.trim();
  const engagementReference = input.engagementReference?.trim();
  const participationReference = input.participationReference?.trim();
  const visitReference = input.visitReference?.trim();
  const parentMemberReference = input.parentMemberReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isMemberProfileKind(input.memberKind)) {
    throw new Error(
      `Unknown member-profile kind: ${String(input.memberKind)}`,
    );
  }

  const memberStatus: MemberProfileStatus =
    input.memberStatus ?? MEMBER_PROFILE_STATUSES.Draft;
  if (!isMemberProfileStatus(memberStatus)) {
    throw new Error(
      `Unknown member-profile status: ${String(input.memberStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.communityReference !== undefined && !communityReference) {
    throw new Error("communityReference must not be empty when provided");
  }
  if (input.engagementReference !== undefined && !engagementReference) {
    throw new Error(
      "engagementReference must not be empty when provided",
    );
  }
  if (
    input.participationReference !== undefined &&
    !participationReference
  ) {
    throw new Error(
      "participationReference must not be empty when provided",
    );
  }
  if (input.visitReference !== undefined && !visitReference) {
    throw new Error("visitReference must not be empty when provided");
  }
  if (
    input.parentMemberReference !== undefined &&
    !parentMemberReference
  ) {
    throw new Error(
      "parentMemberReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "member profile does not apply to this hospitality business",
    );
  }

  const providedReference = input.memberReference?.trim() ?? "";
  if (input.memberReference !== undefined && !providedReference) {
    throw new Error("memberReference must not be empty when provided");
  }

  const memberKind: MemberProfileKind = input.memberKind;
  const memberReference =
    providedReference || allocateMemberProfileReference();

  return {
    memberReference,
    memberKind,
    memberStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(engagementReference !== undefined && engagementReference.length > 0
      ? { engagementReference }
      : {}),
    ...(participationReference !== undefined &&
    participationReference.length > 0
      ? { participationReference }
      : {}),
    ...(visitReference !== undefined && visitReference.length > 0
      ? { visitReference }
      : {}),
    ...(parentMemberReference !== undefined &&
    parentMemberReference.length > 0
      ? { parentMemberReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateMemberProfileReference(): string {
  memberProfileSequence += 1;
  return `member-profile-${memberProfileSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetMemberProfileReferenceSequence(): void {
  memberProfileSequence = 0;
}
