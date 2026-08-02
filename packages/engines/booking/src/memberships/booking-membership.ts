/**
 * Booking Membership Boundary — actor↔community relationship (not CRM / users).
 * Distinct from Authorization (may they?) and Tenant (which scope?).
 *
 * @see DEC-BOOKING-MEMBERSHIP-001
 */

/** Internal membership kinds — not commercial plans or benefit catalogs. */
export const BOOKING_MEMBERSHIP_KINDS = {
  Member: "booking.member",
  Guest: "booking.guest",
  Vip: "booking.vip",
  Staff: "booking.staff",
  Partner: "booking.partner",
} as const;

export type BookingMembershipKind =
  (typeof BOOKING_MEMBERSHIP_KINDS)[keyof typeof BOOKING_MEMBERSHIP_KINDS];

export const BOOKING_MEMBERSHIP_KIND_VALUES = Object.values(
  BOOKING_MEMBERSHIP_KINDS,
) as readonly BookingMembershipKind[];

/** Membership relationship status — not billing / renewal state. */
export const BOOKING_MEMBERSHIP_STATUSES = {
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
  Pending: "pending",
} as const;

export type BookingMembershipStatus =
  (typeof BOOKING_MEMBERSHIP_STATUSES)[keyof typeof BOOKING_MEMBERSHIP_STATUSES];

export const BOOKING_MEMBERSHIP_STATUS_VALUES = Object.values(
  BOOKING_MEMBERSHIP_STATUSES,
) as readonly BookingMembershipStatus[];

/**
 * Opaque membership relationship within a tenant.
 * No emails, phones, documents, credentials, or CRM profiles.
 */
export interface BookingMembership {
  /** Opaque unique membership reference. */
  membershipReference: string;
  /** Explicit tenant scope. */
  tenantReference: string;
  /** Opaque member / actor identity. */
  memberReference: string;
  /** Internal membership kind. */
  membershipKind: BookingMembershipKind;
  /** Relationship status. */
  status: BookingMembershipStatus;
  /** Controlled optional metadata — never PII or secrets. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future membership providers (Runtime adapters).
 * Not wired in this foundation — no CRM SDK.
 */
export interface BookingMembershipPort {
  getMembership(input: {
    tenantReference: string;
    membershipReference: string;
  }): Promise<BookingMembership | null>;
}

export interface CreateBookingMembershipInput {
  tenantReference: string;
  memberReference: string;
  membershipKind: BookingMembershipKind;
  status?: BookingMembershipStatus;
  membershipReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingMembershipKind(
  value: string,
): value is BookingMembershipKind {
  return (BOOKING_MEMBERSHIP_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingMembershipStatus(
  value: string,
): value is BookingMembershipStatus {
  return (BOOKING_MEMBERSHIP_STATUS_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingMembership(
  value: unknown,
): value is BookingMembership {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.membershipReference === "string" &&
    candidate.membershipReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.memberReference === "string" &&
    candidate.memberReference.length > 0 &&
    typeof candidate.membershipKind === "string" &&
    isBookingMembershipKind(candidate.membershipKind) &&
    typeof candidate.status === "string" &&
    isBookingMembershipStatus(candidate.status)
  );
}

export function isBookingMembershipPort(
  value: unknown,
): value is BookingMembershipPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingMembershipPort).getMembership === "function"
  );
}
