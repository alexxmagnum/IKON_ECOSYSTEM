import type {
  CreateExperienceInput,
  ExperienceKind,
  ExperienceStatus,
  HospitalityCustomerExperience,
} from "./experience";
import {
  EXPERIENCE_STATUSES,
  isExperienceKind,
  isExperienceStatus,
} from "./experience";

let experienceSequence = 0;

export interface CreateExperienceOptions {
  /**
   * When set, experience may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityCustomerExperience (in-memory — existence only).
 * Does not personalize, recommend, alert, or open guest vaults.
 */
export function createExperience(
  input: CreateExperienceInput,
  options: CreateExperienceOptions = {},
): HospitalityCustomerExperience {
  const hospitalityReference = input.hospitalityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const actorReference = input.actorReference?.trim();
  const reservationReference = input.reservationReference?.trim();
  const orderReference = input.orderReference?.trim();
  const menuReference = input.menuReference?.trim();
  const tableReference = input.tableReference?.trim();
  const channelReference = input.channelReference?.trim();
  const parentExperienceReference = input.parentExperienceReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isExperienceKind(input.experienceKind)) {
    throw new Error(
      `Unknown experience kind: ${String(input.experienceKind)}`,
    );
  }

  const experienceStatus: ExperienceStatus =
    input.experienceStatus ?? EXPERIENCE_STATUSES.Draft;
  if (!isExperienceStatus(experienceStatus)) {
    throw new Error(
      `Unknown experience status: ${String(input.experienceStatus)}`,
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
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.reservationReference !== undefined && !reservationReference) {
    throw new Error(
      "reservationReference must not be empty when provided",
    );
  }
  if (input.orderReference !== undefined && !orderReference) {
    throw new Error("orderReference must not be empty when provided");
  }
  if (input.menuReference !== undefined && !menuReference) {
    throw new Error("menuReference must not be empty when provided");
  }
  if (input.tableReference !== undefined && !tableReference) {
    throw new Error("tableReference must not be empty when provided");
  }
  if (input.channelReference !== undefined && !channelReference) {
    throw new Error("channelReference must not be empty when provided");
  }
  if (
    input.parentExperienceReference !== undefined &&
    !parentExperienceReference
  ) {
    throw new Error(
      "parentExperienceReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "experience does not apply to this hospitality business",
    );
  }

  const providedReference = input.experienceReference?.trim() ?? "";
  if (input.experienceReference !== undefined && !providedReference) {
    throw new Error(
      "experienceReference must not be empty when provided",
    );
  }

  const experienceKind: ExperienceKind = input.experienceKind;
  const experienceReference =
    providedReference || allocateExperienceReference();

  return {
    experienceReference,
    experienceKind,
    experienceStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(reservationReference !== undefined && reservationReference.length > 0
      ? { reservationReference }
      : {}),
    ...(orderReference !== undefined && orderReference.length > 0
      ? { orderReference }
      : {}),
    ...(menuReference !== undefined && menuReference.length > 0
      ? { menuReference }
      : {}),
    ...(tableReference !== undefined && tableReference.length > 0
      ? { tableReference }
      : {}),
    ...(channelReference !== undefined && channelReference.length > 0
      ? { channelReference }
      : {}),
    ...(parentExperienceReference !== undefined &&
    parentExperienceReference.length > 0
      ? { parentExperienceReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateExperienceReference(): string {
  experienceSequence += 1;
  return `experience-${experienceSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetExperienceReferenceSequence(): void {
  experienceSequence = 0;
}
