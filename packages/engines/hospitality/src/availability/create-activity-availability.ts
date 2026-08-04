import type {
  AvailabilityKind,
  AvailabilityStatus,
  CreateActivityAvailabilityInput,
  HospitalityActivityAvailability,
} from "./activity-availability";
import {
  AVAILABILITY_STATUSES,
  isAvailabilityKind,
  isAvailabilityStatus,
} from "./activity-availability";

let availabilitySequence = 0;

export interface CreateActivityAvailabilityOptions {
  /**
   * When set, availability may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityActivityAvailability (in-memory — openness only).
 * Does not probe slots, hold seats, consume limits, or open tills.
 */
export function createActivityAvailability(
  input: CreateActivityAvailabilityInput,
  options: CreateActivityAvailabilityOptions = {},
): HospitalityActivityAvailability {
  const hospitalityReference = input.hospitalityReference?.trim();
  const activityReference = input.activityReference?.trim();
  const scheduleReference = input.scheduleReference?.trim();
  const capacityReference = input.capacityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const stateReference = input.stateReference?.trim();
  const windowReference = input.windowReference?.trim();
  const parentAvailabilityReference =
    input.parentAvailabilityReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isAvailabilityKind(input.availabilityKind)) {
    throw new Error(
      `Unknown availability kind: ${String(input.availabilityKind)}`,
    );
  }

  const availabilityStatus: AvailabilityStatus =
    input.availabilityStatus ?? AVAILABILITY_STATUSES.Draft;
  if (!isAvailabilityStatus(availabilityStatus)) {
    throw new Error(
      `Unknown availability status: ${String(input.availabilityStatus)}`,
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
  if (input.capacityReference !== undefined && !capacityReference) {
    throw new Error("capacityReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.stateReference !== undefined && !stateReference) {
    throw new Error("stateReference must not be empty when provided");
  }
  if (input.windowReference !== undefined && !windowReference) {
    throw new Error("windowReference must not be empty when provided");
  }
  if (
    input.parentAvailabilityReference !== undefined &&
    !parentAvailabilityReference
  ) {
    throw new Error(
      "parentAvailabilityReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "availability does not apply to this hospitality business",
    );
  }

  const providedReference = input.availabilityReference?.trim() ?? "";
  if (input.availabilityReference !== undefined && !providedReference) {
    throw new Error(
      "availabilityReference must not be empty when provided",
    );
  }

  const availabilityKind: AvailabilityKind = input.availabilityKind;
  const availabilityReference =
    providedReference || allocateAvailabilityReference();

  return {
    availabilityReference,
    availabilityKind,
    availabilityStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(scheduleReference !== undefined && scheduleReference.length > 0
      ? { scheduleReference }
      : {}),
    ...(capacityReference !== undefined && capacityReference.length > 0
      ? { capacityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(stateReference !== undefined && stateReference.length > 0
      ? { stateReference }
      : {}),
    ...(windowReference !== undefined && windowReference.length > 0
      ? { windowReference }
      : {}),
    ...(parentAvailabilityReference !== undefined &&
    parentAvailabilityReference.length > 0
      ? { parentAvailabilityReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateAvailabilityReference(): string {
  availabilitySequence += 1;
  return `availability-${availabilitySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetActivityAvailabilityReferenceSequence(): void {
  availabilitySequence = 0;
}
