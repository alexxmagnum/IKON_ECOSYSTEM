import type {
  CreateVisitExperienceInput,
  HospitalityVisitExperience,
  VisitKind,
  VisitStatus,
} from "./visit-experience";
import {
  VISIT_STATUSES,
  isVisitKind,
  isVisitStatus,
} from "./visit-experience";

let visitSequence = 0;

export interface CreateVisitExperienceOptions {
  /**
   * When set, visit may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityVisitExperience (in-memory — presence only).
 * Does not open tills, bind rooms, open tickets, or scan doors.
 */
export function createVisitExperience(
  input: CreateVisitExperienceInput,
  options: CreateVisitExperienceOptions = {},
): HospitalityVisitExperience {
  const hospitalityReference = input.hospitalityReference?.trim();
  const reservationReference = input.reservationReference?.trim();
  const bookingReference = input.bookingReference?.trim();
  const activityReference = input.activityReference?.trim();
  const scheduleReference = input.scheduleReference?.trim();
  const participationReference = input.participationReference?.trim();
  const actorReference = input.actorReference?.trim();
  const locationReference = input.locationReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentVisitReference = input.parentVisitReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isVisitKind(input.visitKind)) {
    throw new Error(`Unknown visit kind: ${String(input.visitKind)}`);
  }

  const visitStatus: VisitStatus =
    input.visitStatus ?? VISIT_STATUSES.Draft;
  if (!isVisitStatus(visitStatus)) {
    throw new Error(
      `Unknown visit status: ${String(input.visitStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.reservationReference !== undefined && !reservationReference) {
    throw new Error(
      "reservationReference must not be empty when provided",
    );
  }
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (input.scheduleReference !== undefined && !scheduleReference) {
    throw new Error("scheduleReference must not be empty when provided");
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
  if (input.locationReference !== undefined && !locationReference) {
    throw new Error("locationReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.parentVisitReference !== undefined && !parentVisitReference) {
    throw new Error(
      "parentVisitReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "visit does not apply to this hospitality business",
    );
  }

  const providedReference = input.visitReference?.trim() ?? "";
  if (input.visitReference !== undefined && !providedReference) {
    throw new Error("visitReference must not be empty when provided");
  }

  const visitKind: VisitKind = input.visitKind;
  const visitReference = providedReference || allocateVisitReference();

  return {
    visitReference,
    visitKind,
    visitStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(reservationReference !== undefined &&
    reservationReference.length > 0
      ? { reservationReference }
      : {}),
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(scheduleReference !== undefined && scheduleReference.length > 0
      ? { scheduleReference }
      : {}),
    ...(participationReference !== undefined &&
    participationReference.length > 0
      ? { participationReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(locationReference !== undefined && locationReference.length > 0
      ? { locationReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentVisitReference !== undefined &&
    parentVisitReference.length > 0
      ? { parentVisitReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateVisitReference(): string {
  visitSequence += 1;
  return `visit-${visitSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetVisitReferenceSequence(): void {
  visitSequence = 0;
}
