import type {
  BookingModification,
  BookingModificationKind,
  BookingModificationStatus,
  CreateBookingModificationInput,
} from "./booking-modification";
import {
  BOOKING_MODIFICATION_STATUSES,
  isBookingModificationKind,
  isBookingModificationStatus,
} from "./booking-modification";

let modificationSequence = 0;

export interface CreateBookingModificationOptions {
  /**
   * When set, modification may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingModification (in-memory — intent/context only).
 * Does not mutate Booking aggregate, price, pay, notify, or run workflows.
 */
export function createBookingModification(
  input: CreateBookingModificationInput,
  options: CreateBookingModificationOptions = {},
): BookingModification {
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
  if (!isBookingModificationKind(input.modificationKind)) {
    throw new Error(
      `Unknown booking modification kind: ${String(input.modificationKind)}`,
    );
  }

  const modificationStatus: BookingModificationStatus =
    input.modificationStatus ?? BOOKING_MODIFICATION_STATUSES.Requested;
  if (!isBookingModificationStatus(modificationStatus)) {
    throw new Error(
      `Unknown booking modification status: ${String(input.modificationStatus)}`,
    );
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.reasonReference !== undefined && !reasonReference) {
    throw new Error("reasonReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("modification does not apply to this tenant");
  }

  const providedReference = input.modificationReference?.trim() ?? "";
  if (input.modificationReference !== undefined && !providedReference) {
    throw new Error("modificationReference must not be empty when provided");
  }

  const modificationKind: BookingModificationKind = input.modificationKind;
  const modificationReference =
    providedReference || allocateModificationReference();

  return {
    modificationReference,
    tenantReference,
    bookingReference,
    modificationKind,
    modificationStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(reasonReference !== undefined && reasonReference.length > 0
      ? { reasonReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateModificationReference(): string {
  modificationSequence += 1;
  return `modification-${modificationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingModificationReferenceSequence(): void {
  modificationSequence = 0;
}
