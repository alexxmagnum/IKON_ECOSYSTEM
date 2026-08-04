import type {
  CreateReservationInput,
  HospitalityReservation,
  ReservationKind,
  ReservationStatus,
} from "./reservation";
import {
  RESERVATION_STATUSES,
  isReservationKind,
  isReservationStatus,
} from "./reservation";

let reservationSequence = 0;

export interface CreateReservationOptions {
  /**
   * When set, reservation may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityReservation (in-memory — visit-intent existence only).
 * Does not confirm, bind tables, check slots, or open reminder / payment flows.
 */
export function createReservation(
  input: CreateReservationInput,
  options: CreateReservationOptions = {},
): HospitalityReservation {
  const hospitalityReference = input.hospitalityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const tableReference = input.tableReference?.trim();
  const customerReference = input.customerReference?.trim();
  const guestReference = input.guestReference?.trim();
  const dateReference = input.dateReference?.trim();
  const timeReference = input.timeReference?.trim();
  const partySizeReference = input.partySizeReference?.trim();
  const parentReservationReference =
    input.parentReservationReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isReservationKind(input.reservationKind)) {
    throw new Error(
      `Unknown reservation kind: ${String(input.reservationKind)}`,
    );
  }

  const reservationStatus: ReservationStatus =
    input.reservationStatus ?? RESERVATION_STATUSES.Draft;
  if (!isReservationStatus(reservationStatus)) {
    throw new Error(
      `Unknown reservation status: ${String(input.reservationStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.tableReference !== undefined && !tableReference) {
    throw new Error("tableReference must not be empty when provided");
  }
  if (input.customerReference !== undefined && !customerReference) {
    throw new Error("customerReference must not be empty when provided");
  }
  if (input.guestReference !== undefined && !guestReference) {
    throw new Error("guestReference must not be empty when provided");
  }
  if (input.dateReference !== undefined && !dateReference) {
    throw new Error("dateReference must not be empty when provided");
  }
  if (input.timeReference !== undefined && !timeReference) {
    throw new Error("timeReference must not be empty when provided");
  }
  if (input.partySizeReference !== undefined && !partySizeReference) {
    throw new Error("partySizeReference must not be empty when provided");
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

  const reservationKind: ReservationKind = input.reservationKind;
  const reservationReference =
    providedReference || allocateReservationReference();

  return {
    reservationReference,
    reservationKind,
    reservationStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(tableReference !== undefined && tableReference.length > 0
      ? { tableReference }
      : {}),
    ...(customerReference !== undefined && customerReference.length > 0
      ? { customerReference }
      : {}),
    ...(guestReference !== undefined && guestReference.length > 0
      ? { guestReference }
      : {}),
    ...(dateReference !== undefined && dateReference.length > 0
      ? { dateReference }
      : {}),
    ...(timeReference !== undefined && timeReference.length > 0
      ? { timeReference }
      : {}),
    ...(partySizeReference !== undefined && partySizeReference.length > 0
      ? { partySizeReference }
      : {}),
    ...(parentReservationReference !== undefined &&
    parentReservationReference.length > 0
      ? { parentReservationReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateReservationReference(): string {
  reservationSequence += 1;
  return `reservation-${reservationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetReservationReferenceSequence(): void {
  reservationSequence = 0;
}
