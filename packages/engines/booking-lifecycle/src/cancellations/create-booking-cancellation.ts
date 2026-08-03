import type {
  BookingCancellation,
  BookingCancellationKind,
  BookingCancellationStatus,
  CreateBookingCancellationInput,
} from "./booking-cancellation";
import {
  BOOKING_CANCELLATION_STATUSES,
  isBookingCancellationKind,
  isBookingCancellationStatus,
} from "./booking-cancellation";

let cancellationSequence = 0;

export interface CreateBookingCancellationOptions {
  /**
   * When set, cancellation may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingCancellation (in-memory — intent/context only).
 * Does not mutate Booking aggregate, refund, notify, or run workflows.
 */
export function createBookingCancellation(
  input: CreateBookingCancellationInput,
  options: CreateBookingCancellationOptions = {},
): BookingCancellation {
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
  if (!isBookingCancellationKind(input.cancellationKind)) {
    throw new Error(
      `Unknown booking cancellation kind: ${String(input.cancellationKind)}`,
    );
  }

  const cancellationStatus: BookingCancellationStatus =
    input.cancellationStatus ?? BOOKING_CANCELLATION_STATUSES.Requested;
  if (!isBookingCancellationStatus(cancellationStatus)) {
    throw new Error(
      `Unknown booking cancellation status: ${String(input.cancellationStatus)}`,
    );
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.reasonReference !== undefined && !reasonReference) {
    throw new Error("reasonReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("cancellation does not apply to this tenant");
  }

  const providedReference = input.cancellationReference?.trim() ?? "";
  if (input.cancellationReference !== undefined && !providedReference) {
    throw new Error("cancellationReference must not be empty when provided");
  }

  const cancellationKind: BookingCancellationKind = input.cancellationKind;
  const cancellationReference =
    providedReference || allocateCancellationReference();

  return {
    cancellationReference,
    tenantReference,
    bookingReference,
    cancellationKind,
    cancellationStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(reasonReference !== undefined && reasonReference.length > 0
      ? { reasonReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateCancellationReference(): string {
  cancellationSequence += 1;
  return `cancellation-${cancellationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingCancellationReferenceSequence(): void {
  cancellationSequence = 0;
}
