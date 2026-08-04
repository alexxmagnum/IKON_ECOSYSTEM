import type {
  ActivityKind,
  ActivityStatus,
  CreateActivityInput,
  HospitalityActivity,
} from "./activity";
import {
  ACTIVITY_STATUSES,
  isActivityKind,
  isActivityStatus,
} from "./activity";

let activitySequence = 0;

export interface CreateActivityOptions {
  /**
   * When set, activity may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityActivity (in-memory — experience existence only).
 * Does not approve, publish, enroll seats, or open tills.
 */
export function createActivity(
  input: CreateActivityInput,
  options: CreateActivityOptions = {},
): HospitalityActivity {
  const hospitalityReference = input.hospitalityReference?.trim();
  const communityReference = input.communityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const creatorReference = input.creatorReference?.trim();
  const proposalReference = input.proposalReference?.trim();
  const locationReference = input.locationReference?.trim();
  const reservationReference = input.reservationReference?.trim();
  const parentActivityReference = input.parentActivityReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isActivityKind(input.activityKind)) {
    throw new Error(
      `Unknown activity kind: ${String(input.activityKind)}`,
    );
  }

  const activityStatus: ActivityStatus =
    input.activityStatus ?? ACTIVITY_STATUSES.Draft;
  if (!isActivityStatus(activityStatus)) {
    throw new Error(
      `Unknown activity status: ${String(input.activityStatus)}`,
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
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.creatorReference !== undefined && !creatorReference) {
    throw new Error("creatorReference must not be empty when provided");
  }
  if (input.proposalReference !== undefined && !proposalReference) {
    throw new Error("proposalReference must not be empty when provided");
  }
  if (input.locationReference !== undefined && !locationReference) {
    throw new Error("locationReference must not be empty when provided");
  }
  if (input.reservationReference !== undefined && !reservationReference) {
    throw new Error(
      "reservationReference must not be empty when provided",
    );
  }
  if (
    input.parentActivityReference !== undefined &&
    !parentActivityReference
  ) {
    throw new Error(
      "parentActivityReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "activity does not apply to this hospitality business",
    );
  }

  const providedReference = input.activityReference?.trim() ?? "";
  if (input.activityReference !== undefined && !providedReference) {
    throw new Error(
      "activityReference must not be empty when provided",
    );
  }

  const activityKind: ActivityKind = input.activityKind;
  const activityReference =
    providedReference || allocateActivityReference();

  return {
    activityReference,
    activityKind,
    activityStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(creatorReference !== undefined && creatorReference.length > 0
      ? { creatorReference }
      : {}),
    ...(proposalReference !== undefined && proposalReference.length > 0
      ? { proposalReference }
      : {}),
    ...(locationReference !== undefined && locationReference.length > 0
      ? { locationReference }
      : {}),
    ...(reservationReference !== undefined &&
    reservationReference.length > 0
      ? { reservationReference }
      : {}),
    ...(parentActivityReference !== undefined &&
    parentActivityReference.length > 0
      ? { parentActivityReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateActivityReference(): string {
  activitySequence += 1;
  return `activity-${activitySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetActivityReferenceSequence(): void {
  activitySequence = 0;
}
