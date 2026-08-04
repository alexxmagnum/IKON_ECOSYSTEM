import type {
  CreateReservationRuntimeInput,
  HospitalityReservationRuntime,
  ReservationRuntimeKind,
  ReservationRuntimeStatus,
} from "./reservation";
import {
  RESERVATION_RUNTIME_STATUSES,
  isReservationRuntimeKind,
  isReservationRuntimeStatus,
} from "./reservation";

let reservationRuntimeSequence = 0;

export interface CreateReservationRuntimeOptions {
  /**
   * When set, reservation may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityReservationRuntime (in-memory — commitment only).
 * Does not open tills, bind rooms, ring tickets, or scan doors.
 */
export function createReservationRuntime(
  input: CreateReservationRuntimeInput,
  options: CreateReservationRuntimeOptions = {},
): HospitalityReservationRuntime {
  const hospitalityReference = input.hospitalityReference?.trim();
  const activityReference = input.activityReference?.trim();
  const scheduleReference = input.scheduleReference?.trim();
  const bookingReference = input.bookingReference?.trim();
  const participationReference = input.participationReference?.trim();
  const availabilityReference = input.availabilityReference?.trim();
  const actorReference = input.actorReference?.trim();
  const guestReference = input.guestReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentReservationReference = input.parentReservationReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isReservationRuntimeKind(input.reservationKind)) {
    throw new Error(
      `Unknown reservation-runtime kind: ${String(input.reservationKind)}`,
    );
  }

  const reservationStatus: ReservationRuntimeStatus =
    input.reservationStatus ?? RESERVATION_RUNTIME_STATUSES.Draft;
  if (!isReservationRuntimeStatus(reservationStatus)) {
    throw new Error(
      `Unknown reservation-runtime status: ${String(input.reservationStatus)}`,
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
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (
    input.participationReference !== undefined &&
    !participationReference
  ) {
    throw new Error(
      "participationReference must not be empty when provided",
    );
  }
  if (input.availabilityReference !== undefined && !availabilityReference) {
    throw new Error(
      "availabilityReference must not be empty when provided",
    );
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.guestReference !== undefined && !guestReference) {
    throw new Error("guestReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (
    input.parentReservationReference !== undefined &&
    !parentReservationReference
  ) {
    throw new Error(
      "parentReservationReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "reservation does not apply to this hospitality business",
    );
  }

  const providedReference = input.reservationReference?.trim() ?? "";
  if (input.reservationReference !== undefined && !providedReference) {
    throw new Error(
      "reservationReference must not be empty when provided",
    );
  }

  const reservationKind: ReservationRuntimeKind = input.reservationKind;
  const reservationReference =
    providedReference || allocateReservationRuntimeReference();

  return {
    reservationReference,
    reservationKind,
    reservationStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(scheduleReference !== undefined && scheduleReference.length > 0
      ? { scheduleReference }
      : {}),
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(participationReference !== undefined &&
    participationReference.length > 0
      ? { participationReference }
      : {}),
    ...(availabilityReference !== undefined &&
    availabilityReference.length > 0
      ? { availabilityReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(guestReference !== undefined && guestReference.length > 0
      ? { guestReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentReservationReference !== undefined &&
    parentReservationReference.length > 0
      ? { parentReservationReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateReservationRuntimeReference(): string {
  reservationRuntimeSequence += 1;
  return `reservation-runtime-${reservationRuntimeSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetReservationRuntimeReferenceSequence(): void {
  reservationRuntimeSequence = 0;
}
