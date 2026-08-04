import type {
  BookingKind,
  BookingStatus,
  CreateBookingRequestInput,
  HospitalityBookingRequest,
} from "./booking-request";
import {
  BOOKING_STATUSES,
  isBookingKind,
  isBookingStatus,
} from "./booking-request";

let bookingSequence = 0;

export interface CreateBookingRequestOptions {
  /**
   * When set, booking may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityBookingRequest (in-memory — intent existence only).
 * Does not accept, reject, open tills, or assign rooms.
 */
export function createBookingRequest(
  input: CreateBookingRequestInput,
  options: CreateBookingRequestOptions = {},
): HospitalityBookingRequest {
  const hospitalityReference = input.hospitalityReference?.trim();
  const activityReference = input.activityReference?.trim();
  const scheduleReference = input.scheduleReference?.trim();
  const availabilityReference = input.availabilityReference?.trim();
  const participationReference = input.participationReference?.trim();
  const actorReference = input.actorReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentBookingReference = input.parentBookingReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

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

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (input.scheduleReference !== undefined && !scheduleReference) {
    throw new Error("scheduleReference must not be empty when provided");
  }
  if (input.availabilityReference !== undefined && !availabilityReference) {
    throw new Error(
      "availabilityReference must not be empty when provided",
    );
  }
  if (
    input.participationReference !== undefined &&
    !participationReference
  ) {
    throw new Error(
      "participationReference must not be empty when provided",
    );
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
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

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "booking does not apply to this hospitality business",
    );
  }

  const providedReference = input.bookingReference?.trim() ?? "";
  if (input.bookingReference !== undefined && !providedReference) {
    throw new Error(
      "bookingReference must not be empty when provided",
    );
  }

  const bookingKind: BookingKind = input.bookingKind;
  const bookingReference =
    providedReference || allocateBookingReference();

  return {
    bookingReference,
    bookingKind,
    bookingStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(scheduleReference !== undefined && scheduleReference.length > 0
      ? { scheduleReference }
      : {}),
    ...(availabilityReference !== undefined &&
    availabilityReference.length > 0
      ? { availabilityReference }
      : {}),
    ...(participationReference !== undefined &&
    participationReference.length > 0
      ? { participationReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentBookingReference !== undefined &&
    parentBookingReference.length > 0
      ? { parentBookingReference }
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
