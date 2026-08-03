import type {
  BookingWaitlist,
  BookingWaitlistKind,
  BookingWaitlistStatus,
  CreateBookingWaitlistInput,
} from "./booking-waitlist";
import {
  BOOKING_WAITLIST_STATUSES,
  isBookingWaitlistKind,
  isBookingWaitlistStatus,
} from "./booking-waitlist";

let waitlistSequence = 0;

export interface CreateBookingWaitlistOptions {
  /**
   * When set, waitlist may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingWaitlist (in-memory — waiting intent only).
 * Does not check availability, assign resources, create bookings, or notify.
 * bookingReference is optional — waitlist may exist before any Booking.
 */
export function createBookingWaitlist(
  input: CreateBookingWaitlistInput,
  options: CreateBookingWaitlistOptions = {},
): BookingWaitlist {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim();
  const actorReference = input.actorReference?.trim();
  const availabilityReference = input.availabilityReference?.trim();
  const requestedDateReference = input.requestedDateReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isBookingWaitlistKind(input.waitlistKind)) {
    throw new Error(
      `Unknown booking waitlist kind: ${String(input.waitlistKind)}`,
    );
  }

  const waitlistStatus: BookingWaitlistStatus =
    input.waitlistStatus ?? BOOKING_WAITLIST_STATUSES.Waiting;
  if (!isBookingWaitlistStatus(waitlistStatus)) {
    throw new Error(
      `Unknown booking waitlist status: ${String(input.waitlistStatus)}`,
    );
  }

  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.availabilityReference !== undefined && !availabilityReference) {
    throw new Error("availabilityReference must not be empty when provided");
  }
  if (input.requestedDateReference !== undefined && !requestedDateReference) {
    throw new Error("requestedDateReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("waitlist does not apply to this tenant");
  }

  const providedReference = input.waitlistReference?.trim() ?? "";
  if (input.waitlistReference !== undefined && !providedReference) {
    throw new Error("waitlistReference must not be empty when provided");
  }

  const waitlistKind: BookingWaitlistKind = input.waitlistKind;
  const waitlistReference = providedReference || allocateWaitlistReference();

  return {
    waitlistReference,
    tenantReference,
    waitlistKind,
    waitlistStatus,
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(availabilityReference !== undefined && availabilityReference.length > 0
      ? { availabilityReference }
      : {}),
    ...(requestedDateReference !== undefined &&
    requestedDateReference.length > 0
      ? { requestedDateReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateWaitlistReference(): string {
  waitlistSequence += 1;
  return `waitlist-${waitlistSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingWaitlistReferenceSequence(): void {
  waitlistSequence = 0;
}
