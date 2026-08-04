import type {
  CapacityKind,
  CapacityStatus,
  CreateActivityCapacityInput,
  HospitalityActivityCapacity,
} from "./activity-capacity";
import {
  CAPACITY_STATUSES,
  isCapacityKind,
  isCapacityStatus,
} from "./activity-capacity";

let capacitySequence = 0;

export interface CreateActivityCapacityOptions {
  /**
   * When set, capacity may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityActivityCapacity (in-memory — limit existence only).
 * Does not probe slots, hold seats, open waitlists, or open tills.
 */
export function createActivityCapacity(
  input: CreateActivityCapacityInput,
  options: CreateActivityCapacityOptions = {},
): HospitalityActivityCapacity {
  const hospitalityReference = input.hospitalityReference?.trim();
  const activityReference = input.activityReference?.trim();
  const scheduleReference = input.scheduleReference?.trim();
  const contextReference = input.contextReference?.trim();
  const limitReference = input.limitReference?.trim();
  const minimumReference = input.minimumReference?.trim();
  const parentCapacityReference = input.parentCapacityReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isCapacityKind(input.capacityKind)) {
    throw new Error(
      `Unknown capacity kind: ${String(input.capacityKind)}`,
    );
  }

  const capacityStatus: CapacityStatus =
    input.capacityStatus ?? CAPACITY_STATUSES.Draft;
  if (!isCapacityStatus(capacityStatus)) {
    throw new Error(
      `Unknown capacity status: ${String(input.capacityStatus)}`,
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
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.limitReference !== undefined && !limitReference) {
    throw new Error("limitReference must not be empty when provided");
  }
  if (input.minimumReference !== undefined && !minimumReference) {
    throw new Error("minimumReference must not be empty when provided");
  }
  if (
    input.parentCapacityReference !== undefined &&
    !parentCapacityReference
  ) {
    throw new Error(
      "parentCapacityReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "capacity does not apply to this hospitality business",
    );
  }

  const providedReference = input.capacityReference?.trim() ?? "";
  if (input.capacityReference !== undefined && !providedReference) {
    throw new Error(
      "capacityReference must not be empty when provided",
    );
  }

  const capacityKind: CapacityKind = input.capacityKind;
  const capacityReference =
    providedReference || allocateCapacityReference();

  return {
    capacityReference,
    capacityKind,
    capacityStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(scheduleReference !== undefined && scheduleReference.length > 0
      ? { scheduleReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(limitReference !== undefined && limitReference.length > 0
      ? { limitReference }
      : {}),
    ...(minimumReference !== undefined && minimumReference.length > 0
      ? { minimumReference }
      : {}),
    ...(parentCapacityReference !== undefined &&
    parentCapacityReference.length > 0
      ? { parentCapacityReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateCapacityReference(): string {
  capacitySequence += 1;
  return `capacity-${capacitySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetActivityCapacityReferenceSequence(): void {
  capacitySequence = 0;
}
