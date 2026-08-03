import type {
  BookingReschedule,
  BookingRescheduleKind,
  BookingRescheduleStatus,
  CreateBookingRescheduleInput,
} from "./booking-reschedule";
import {
  BOOKING_RESCHEDULE_STATUSES,
  isBookingRescheduleKind,
  isBookingRescheduleStatus,
} from "./booking-reschedule";

let rescheduleSequence = 0;

export interface CreateBookingRescheduleOptions {
  /**
   * When set, reschedule may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingReschedule (in-memory — intent/context only).
 * Does not mutate Booking aggregate, check availability, price, or notify.
 */
export function createBookingReschedule(
  input: CreateBookingRescheduleInput,
  options: CreateBookingRescheduleOptions = {},
): BookingReschedule {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim() ?? "";
  const currentStartReference = input.currentStartReference?.trim() ?? "";
  const requestedStartReference = input.requestedStartReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const reasonReference = input.reasonReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!bookingReference) {
    throw new Error("bookingReference is required");
  }
  if (!currentStartReference) {
    throw new Error("currentStartReference is required");
  }
  if (!requestedStartReference) {
    throw new Error("requestedStartReference is required");
  }
  if (!isBookingRescheduleKind(input.rescheduleKind)) {
    throw new Error(
      `Unknown booking reschedule kind: ${String(input.rescheduleKind)}`,
    );
  }

  const rescheduleStatus: BookingRescheduleStatus =
    input.rescheduleStatus ?? BOOKING_RESCHEDULE_STATUSES.Requested;
  if (!isBookingRescheduleStatus(rescheduleStatus)) {
    throw new Error(
      `Unknown booking reschedule status: ${String(input.rescheduleStatus)}`,
    );
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.reasonReference !== undefined && !reasonReference) {
    throw new Error("reasonReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("reschedule does not apply to this tenant");
  }

  const providedReference = input.rescheduleReference?.trim() ?? "";
  if (input.rescheduleReference !== undefined && !providedReference) {
    throw new Error("rescheduleReference must not be empty when provided");
  }

  const rescheduleKind: BookingRescheduleKind = input.rescheduleKind;
  const rescheduleReference =
    providedReference || allocateRescheduleReference();

  return {
    rescheduleReference,
    tenantReference,
    bookingReference,
    rescheduleKind,
    rescheduleStatus,
    currentStartReference,
    requestedStartReference,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(reasonReference !== undefined && reasonReference.length > 0
      ? { reasonReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateRescheduleReference(): string {
  rescheduleSequence += 1;
  return `reschedule-${rescheduleSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingRescheduleReferenceSequence(): void {
  rescheduleSequence = 0;
}
