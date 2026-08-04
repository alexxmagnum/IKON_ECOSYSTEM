import type {
  CommunityKind,
  CommunityStatus,
  CreateCommunityInput,
  HospitalityCommunity,
} from "./community";
import {
  COMMUNITY_STATUSES,
  isCommunityKind,
  isCommunityStatus,
} from "./community";

let communitySequence = 0;

export interface CreateCommunityOptions {
  /**
   * When set, community may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityCommunity (in-memory — group existence only).
 * Does not enroll people, open gatherings, or attach scores.
 */
export function createCommunity(
  input: CreateCommunityInput,
  options: CreateCommunityOptions = {},
): HospitalityCommunity {
  const hospitalityReference = input.hospitalityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const organizationReference = input.organizationReference?.trim();
  const membershipReference = input.membershipReference?.trim();
  const parentCommunityReference = input.parentCommunityReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isCommunityKind(input.communityKind)) {
    throw new Error(
      `Unknown community kind: ${String(input.communityKind)}`,
    );
  }

  const communityStatus: CommunityStatus =
    input.communityStatus ?? COMMUNITY_STATUSES.Draft;
  if (!isCommunityStatus(communityStatus)) {
    throw new Error(
      `Unknown community status: ${String(input.communityStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.organizationReference !== undefined && !organizationReference) {
    throw new Error(
      "organizationReference must not be empty when provided",
    );
  }
  if (input.membershipReference !== undefined && !membershipReference) {
    throw new Error(
      "membershipReference must not be empty when provided",
    );
  }
  if (
    input.parentCommunityReference !== undefined &&
    !parentCommunityReference
  ) {
    throw new Error(
      "parentCommunityReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "community does not apply to this hospitality business",
    );
  }

  const providedReference = input.communityReference?.trim() ?? "";
  if (input.communityReference !== undefined && !providedReference) {
    throw new Error(
      "communityReference must not be empty when provided",
    );
  }

  const communityKind: CommunityKind = input.communityKind;
  const communityReference =
    providedReference || allocateCommunityReference();

  return {
    communityReference,
    communityKind,
    communityStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(organizationReference !== undefined &&
    organizationReference.length > 0
      ? { organizationReference }
      : {}),
    ...(membershipReference !== undefined && membershipReference.length > 0
      ? { membershipReference }
      : {}),
    ...(parentCommunityReference !== undefined &&
    parentCommunityReference.length > 0
      ? { parentCommunityReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateCommunityReference(): string {
  communitySequence += 1;
  return `community-${communitySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetCommunityReferenceSequence(): void {
  communitySequence = 0;
}
