import type {
  Booking,
  BookingKind,
  BookingStatus,
  CreateBookingInput,
} from "./booking";
import {
  BOOKING_SLOT_REF_KEY,
  BOOKING_STATUSES,
  BOOKING_UNIT_REF_KEY,
  isBookingKind,
  isBookingStatus,
} from "./booking";

let bookingSequence = 0;

export interface CreateBookingOptions {
  /**
   * When set, booking may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Booking (in-memory — reservation existence only).
 * Does not open vendor sessions or run hold / claim / collect flows.
 */
export function createBooking(
  input: CreateBookingInput,
  options: CreateBookingOptions = {},
): Booking {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const catalogReference = input.catalogReference?.trim();
  const actorReference = input.actorReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentBookingReference = input.parentBookingReference?.trim();
  const unitRaw = input[BOOKING_UNIT_REF_KEY];
  const unitReference =
    typeof unitRaw === "string" ? unitRaw.trim() : undefined;
  const slotRaw = input[BOOKING_SLOT_REF_KEY];
  const slotReference =
    typeof slotRaw === "string" ? slotRaw.trim() : undefined;
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isBookingKind(input.bookingKind)) {
    throw new Error(`Unknown booking kind: ${String(input.bookingKind)}`);
  }

  const bookingStatus: BookingStatus =
    input.bookingStatus ?? BOOKING_STATUSES.Draft;
  if (!isBookingStatus(bookingStatus)) {
    throw new Error(
      `Unknown booking status: ${String(input.bookingStatus)}`,
    );
  }

  if (input.catalogReference !== undefined && !catalogReference) {
    throw new Error("catalogReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error("experienceReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (
    input.parentBookingReference !== undefined &&
    !parentBookingReference
  ) {
    throw new Error(
      "parentBookingReference must not be empty when provided",
    );
  }
  if (unitRaw !== undefined && !unitReference) {
    throw new Error(
      `${BOOKING_UNIT_REF_KEY} must not be empty when provided`,
    );
  }
  if (slotRaw !== undefined && !slotReference) {
    throw new Error(
      `${BOOKING_SLOT_REF_KEY} must not be empty when provided`,
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("booking does not apply to this tenant");
  }

  const providedReference = input.bookingReference?.trim() ?? "";
  if (input.bookingReference !== undefined && !providedReference) {
    throw new Error("bookingReference must not be empty when provided");
  }

  const bookingKind: BookingKind = input.bookingKind;
  const bookingReference = providedReference || allocateBookingReference();

  return {
    bookingReference,
    tenantReference,
    bookingKind,
    bookingStatus,
    ...(catalogReference !== undefined && catalogReference.length > 0
      ? { catalogReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentBookingReference !== undefined &&
    parentBookingReference.length > 0
      ? { parentBookingReference }
      : {}),
    ...(unitReference !== undefined && unitReference.length > 0
      ? { [BOOKING_UNIT_REF_KEY]: unitReference }
      : {}),
    ...(slotReference !== undefined && slotReference.length > 0
      ? { [BOOKING_SLOT_REF_KEY]: slotReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateBookingReference(): string {
  bookingSequence += 1;
  return `booking-${bookingSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingReferenceSequence(): void {
  bookingSequence = 0;
}
