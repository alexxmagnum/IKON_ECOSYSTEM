import type {
  Community,
  CommunityKind,
  CommunityStatus,
  CreateCommunityInput,
} from "./community";
import {
  COMMUNITY_STATUSES,
  isCommunityKind,
  isCommunityStatus,
} from "./community";

let communitySequence = 0;

export interface CreateCommunityOptions {
  /**
   * When set, community may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Community (in-memory — definition only).
 * Does not manage members, chat, invites, ranking, or auth.
 */
export function createCommunity(
  input: CreateCommunityInput,
  options: CreateCommunityOptions = {},
): Community {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const actorReference = input.actorReference?.trim();
  const parentCommunityReference = input.parentCommunityReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
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

  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (
    input.parentCommunityReference !== undefined &&
    !parentCommunityReference
  ) {
    throw new Error(
      "parentCommunityReference must not be empty when provided",
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("community does not apply to this tenant");
  }

  const providedReference = input.communityReference?.trim() ?? "";
  if (input.communityReference !== undefined && !providedReference) {
    throw new Error("communityReference must not be empty when provided");
  }

  const communityKind: CommunityKind = input.communityKind;
  const communityReference =
    providedReference || allocateCommunityReference();

  return {
    communityReference,
    tenantReference,
    communityKind,
    communityStatus,
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
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
