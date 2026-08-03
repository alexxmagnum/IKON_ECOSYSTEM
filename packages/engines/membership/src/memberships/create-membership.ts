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
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Membership (in-memory — belonging-relation existence only).
 * Does not open person profiles, grant access, or run charge flows.
 */
export function createMembership(
  input: CreateMembershipInput,
  options: CreateMembershipOptions = {},
): Membership {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const customerReference = input.customerReference?.trim();
  const organizationReference = input.organizationReference?.trim();
  const contextReference = input.contextReference?.trim();
  const planReference = input.planReference?.trim();
  const parentMembershipReference = input.parentMembershipReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
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

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.customerReference !== undefined && !customerReference) {
    throw new Error("customerReference must not be empty when provided");
  }
  if (input.organizationReference !== undefined && !organizationReference) {
    throw new Error("organizationReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.planReference !== undefined && !planReference) {
    throw new Error("planReference must not be empty when provided");
  }
  if (
    input.parentMembershipReference !== undefined &&
    !parentMembershipReference
  ) {
    throw new Error(
      "parentMembershipReference must not be empty when provided",
    );
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
    membershipKind,
    membershipStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(customerReference !== undefined && customerReference.length > 0
      ? { customerReference }
      : {}),
    ...(organizationReference !== undefined && organizationReference.length > 0
      ? { organizationReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(planReference !== undefined && planReference.length > 0
      ? { planReference }
      : {}),
    ...(parentMembershipReference !== undefined &&
    parentMembershipReference.length > 0
      ? { parentMembershipReference }
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
