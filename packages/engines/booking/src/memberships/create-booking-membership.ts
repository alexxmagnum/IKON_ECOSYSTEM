import type {
  BookingMembership,
  BookingMembershipKind,
  BookingMembershipStatus,
  CreateBookingMembershipInput,
} from "./booking-membership";
import {
  BOOKING_MEMBERSHIP_STATUSES,
  isBookingMembershipKind,
  isBookingMembershipStatus,
} from "./booking-membership";

let membershipSequence = 0;

/**
 * Build a validated BookingMembership (in-memory — no CRM / user store).
 */
export function createBookingMembership(
  input: CreateBookingMembershipInput,
): BookingMembership {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const memberReference = input.memberReference?.trim() ?? "";

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!memberReference) {
    throw new Error("memberReference is required");
  }
  if (!isBookingMembershipKind(input.membershipKind)) {
    throw new Error(
      `Unknown booking membership kind: ${String(input.membershipKind)}`,
    );
  }

  const status: BookingMembershipStatus =
    input.status ?? BOOKING_MEMBERSHIP_STATUSES.Active;
  if (!isBookingMembershipStatus(status)) {
    throw new Error(`Unknown booking membership status: ${String(status)}`);
  }

  const membershipKind: BookingMembershipKind = input.membershipKind;
  const membershipReference =
    input.membershipReference?.trim() || allocateMembershipReference();

  if (!membershipReference) {
    throw new Error("membershipReference is required");
  }

  return {
    membershipReference,
    tenantReference,
    memberReference,
    membershipKind,
    status,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

/**
 * Tenant isolation helper for memberships (DEC-BOOKING-TENANT-001).
 */
export function membershipBelongsToTenant(
  membership: BookingMembership,
  tenantReference: string,
): boolean {
  const expected = tenantReference.trim();
  if (!expected) {
    return false;
  }
  return membership.tenantReference === expected;
}

function allocateMembershipReference(): string {
  membershipSequence += 1;
  return `membership-${membershipSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingMembershipReferenceSequence(): void {
  membershipSequence = 0;
}
