import type {
  BookingCheckIn,
  BookingCheckInKind,
  BookingCheckInStatus,
  CreateBookingCheckInInput,
} from "./booking-checkin";
import {
  BOOKING_CHECK_IN_STATUSES,
  isBookingCheckInKind,
  isBookingCheckInStatus,
} from "./booking-checkin";

let checkInSequence = 0;

export interface CreateBookingCheckInOptions {
  /**
   * When set, check-in may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingCheckIn (in-memory — arrival context only).
 * Does not mutate Booking aggregate, assign resources, pay, or notify.
 */
export function createBookingCheckIn(
  input: CreateBookingCheckInInput,
  options: CreateBookingCheckInOptions = {},
): BookingCheckIn {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const reasonReference = input.reasonReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!bookingReference) {
    throw new Error("bookingReference is required");
  }
  if (!isBookingCheckInKind(input.checkInKind)) {
    throw new Error(
      `Unknown booking check-in kind: ${String(input.checkInKind)}`,
    );
  }

  const checkInStatus: BookingCheckInStatus =
    input.checkInStatus ?? BOOKING_CHECK_IN_STATUSES.Requested;
  if (!isBookingCheckInStatus(checkInStatus)) {
    throw new Error(
      `Unknown booking check-in status: ${String(input.checkInStatus)}`,
    );
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.reasonReference !== undefined && !reasonReference) {
    throw new Error("reasonReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("check-in does not apply to this tenant");
  }

  const providedReference = input.checkInReference?.trim() ?? "";
  if (input.checkInReference !== undefined && !providedReference) {
    throw new Error("checkInReference must not be empty when provided");
  }

  const checkInKind: BookingCheckInKind = input.checkInKind;
  const checkInReference = providedReference || allocateCheckInReference();

  return {
    checkInReference,
    tenantReference,
    bookingReference,
    checkInKind,
    checkInStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(reasonReference !== undefined && reasonReference.length > 0
      ? { reasonReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateCheckInReference(): string {
  checkInSequence += 1;
  return `checkin-${checkInSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingCheckInReferenceSequence(): void {
  checkInSequence = 0;
}
