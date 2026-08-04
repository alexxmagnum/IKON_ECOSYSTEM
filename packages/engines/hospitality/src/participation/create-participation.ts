import type {
  CreateParticipationInput,
  HospitalityParticipation,
  ParticipationKind,
  ParticipationStatus,
} from "./participation";
import {
  PARTICIPATION_STATUSES,
  isParticipationKind,
  isParticipationStatus,
} from "./participation";

let participationSequence = 0;

export interface CreateParticipationOptions {
  /**
   * When set, participation may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityParticipation (in-memory — relation existence only).
 * Does not enroll, confirm, hold seats, scan doors, or open tills.
 */
export function createParticipation(
  input: CreateParticipationInput,
  options: CreateParticipationOptions = {},
): HospitalityParticipation {
  const hospitalityReference = input.hospitalityReference?.trim();
  const communityReference = input.communityReference?.trim();
  const activityReference = input.activityReference?.trim();
  const actorReference = input.actorReference?.trim();
  const memberReference = input.memberReference?.trim();
  const reservationReference = input.reservationReference?.trim();
  const parentParticipationReference =
    input.parentParticipationReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isParticipationKind(input.participationKind)) {
    throw new Error(
      `Unknown participation kind: ${String(input.participationKind)}`,
    );
  }

  const participationStatus: ParticipationStatus =
    input.participationStatus ?? PARTICIPATION_STATUSES.Draft;
  if (!isParticipationStatus(participationStatus)) {
    throw new Error(
      `Unknown participation status: ${String(input.participationStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.communityReference !== undefined && !communityReference) {
    throw new Error(
      "communityReference must not be empty when provided",
    );
  }
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.memberReference !== undefined && !memberReference) {
    throw new Error("memberReference must not be empty when provided");
  }
  if (input.reservationReference !== undefined && !reservationReference) {
    throw new Error(
      "reservationReference must not be empty when provided",
    );
  }
  if (
    input.parentParticipationReference !== undefined &&
    !parentParticipationReference
  ) {
    throw new Error(
      "parentParticipationReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "participation does not apply to this hospitality business",
    );
  }

  const providedReference = input.participationReference?.trim() ?? "";
  if (input.participationReference !== undefined && !providedReference) {
    throw new Error(
      "participationReference must not be empty when provided",
    );
  }

  const participationKind: ParticipationKind = input.participationKind;
  const participationReference =
    providedReference || allocateParticipationReference();

  return {
    participationReference,
    participationKind,
    participationStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(memberReference !== undefined && memberReference.length > 0
      ? { memberReference }
      : {}),
    ...(reservationReference !== undefined &&
    reservationReference.length > 0
      ? { reservationReference }
      : {}),
    ...(parentParticipationReference !== undefined &&
    parentParticipationReference.length > 0
      ? { parentParticipationReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateParticipationReference(): string {
  participationSequence += 1;
  return `participation-${participationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetParticipationReferenceSequence(): void {
  participationSequence = 0;
}
