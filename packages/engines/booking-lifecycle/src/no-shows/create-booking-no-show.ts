import type {
  BookingNoShow,
  BookingNoShowKind,
  BookingNoShowStatus,
  CreateBookingNoShowInput,
} from "./booking-no-show";
import {
  BOOKING_NO_SHOW_STATUSES,
  isBookingNoShowKind,
  isBookingNoShowStatus,
} from "./booking-no-show";

let noShowSequence = 0;

export interface CreateBookingNoShowOptions {
  /**
   * When set, no-show may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingNoShow (in-memory — absence context only).
 * Does not mutate Booking aggregate, release resources, fee, pay, or notify.
 */
export function createBookingNoShow(
  input: CreateBookingNoShowInput,
  options: CreateBookingNoShowOptions = {},
): BookingNoShow {
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
  if (!isBookingNoShowKind(input.noShowKind)) {
    throw new Error(
      `Unknown booking no-show kind: ${String(input.noShowKind)}`,
    );
  }

  const noShowStatus: BookingNoShowStatus =
    input.noShowStatus ?? BOOKING_NO_SHOW_STATUSES.Detected;
  if (!isBookingNoShowStatus(noShowStatus)) {
    throw new Error(
      `Unknown booking no-show status: ${String(input.noShowStatus)}`,
    );
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.reasonReference !== undefined && !reasonReference) {
    throw new Error("reasonReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("no-show does not apply to this tenant");
  }

  const providedReference = input.noShowReference?.trim() ?? "";
  if (input.noShowReference !== undefined && !providedReference) {
    throw new Error("noShowReference must not be empty when provided");
  }

  const noShowKind: BookingNoShowKind = input.noShowKind;
  const noShowReference = providedReference || allocateNoShowReference();

  return {
    noShowReference,
    tenantReference,
    bookingReference,
    noShowKind,
    noShowStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(reasonReference !== undefined && reasonReference.length > 0
      ? { reasonReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateNoShowReference(): string {
  noShowSequence += 1;
  return `noshow-${noShowSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingNoShowReferenceSequence(): void {
  noShowSequence = 0;
}
