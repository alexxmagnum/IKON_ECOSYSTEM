import type {
  CreateMembershipInput,
  Membership,
  MembershipKind,
  MembershipStatus,
} from "./membership";
import {
  MEMBERSHIP_STATUSES,
  isMembershipKind,
  isMembershipStatus,
} from "./membership";

let membershipSequence = 0;

export interface CreateMembershipOptions {
  /**
   * When set, membership may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Membership (in-memory — relation only).
 * Does not charge members, create plans, or assign permissions.
 */
export function createMembership(
  input: CreateMembershipInput,
  options: CreateMembershipOptions = {},
): Membership {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const identityReference = input.identityReference?.trim() ?? "";
  const organizationReference = input.organizationReference?.trim();
  const startReference = input.startReference?.trim();
  const endReference = input.endReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!identityReference) {
    throw new Error("identityReference is required");
  }
  if (!isMembershipKind(input.membershipKind)) {
    throw new Error(
      `Unknown membership kind: ${String(input.membershipKind)}`,
    );
  }

  const membershipStatus: MembershipStatus =
    input.membershipStatus ?? MEMBERSHIP_STATUSES.Draft;
  if (!isMembershipStatus(membershipStatus)) {
    throw new Error(
      `Unknown membership status: ${String(input.membershipStatus)}`,
    );
  }

  if (input.organizationReference !== undefined && !organizationReference) {
    throw new Error("organizationReference must not be empty when provided");
  }
  if (input.startReference !== undefined && !startReference) {
    throw new Error("startReference must not be empty when provided");
  }
  if (input.endReference !== undefined && !endReference) {
    throw new Error("endReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("membership does not apply to this tenant");
  }

  const providedReference = input.membershipReference?.trim() ?? "";
  if (input.membershipReference !== undefined && !providedReference) {
    throw new Error("membershipReference must not be empty when provided");
  }

  const membershipKind: MembershipKind = input.membershipKind;
  const membershipReference =
    providedReference || allocateMembershipReference();

  return {
    membershipReference,
    tenantReference,
    identityReference,
    membershipKind,
    membershipStatus,
    ...(organizationReference !== undefined && organizationReference.length > 0
      ? { organizationReference }
      : {}),
    ...(startReference !== undefined && startReference.length > 0
      ? { startReference }
      : {}),
    ...(endReference !== undefined && endReference.length > 0
      ? { endReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateMembershipReference(): string {
  membershipSequence += 1;
  return `membership-${membershipSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetMembershipReferenceSequence(): void {
  membershipSequence = 0;
}
