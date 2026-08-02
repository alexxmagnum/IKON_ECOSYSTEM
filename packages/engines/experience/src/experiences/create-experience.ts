import type {
  CreateExperienceInput,
  Experience,
  ExperienceKind,
  ExperienceStatus,
} from "./experience";
import {
  EXPERIENCE_STATUSES,
  isExperienceKind,
  isExperienceStatus,
} from "./experience";

let experienceSequence = 0;

export interface CreateExperienceOptions {
  /**
   * When set, experience may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Experience (in-memory — offering definition only).
 * Does not publish calendar events, create bookings, assign resources, or charge.
 */
export function createExperience(
  input: CreateExperienceInput,
  options: CreateExperienceOptions = {},
): Experience {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const resourceReference = input.resourceReference?.trim();
  const parentExperienceReference = input.parentExperienceReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
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

  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (input.resourceReference !== undefined && !resourceReference) {
    throw new Error("resourceReference must not be empty when provided");
  }
  if (
    input.parentExperienceReference !== undefined &&
    !parentExperienceReference
  ) {
    throw new Error(
      "parentExperienceReference must not be empty when provided",
    );
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("experience does not apply to this tenant");
  }

  const providedReference = input.experienceReference?.trim() ?? "";
  if (input.experienceReference !== undefined && !providedReference) {
    throw new Error("experienceReference must not be empty when provided");
  }

  const experienceKind: ExperienceKind = input.experienceKind;
  const experienceReference =
    providedReference || allocateExperienceReference();

  return {
    experienceReference,
    tenantReference,
    experienceKind,
    experienceStatus,
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(resourceReference !== undefined && resourceReference.length > 0
      ? { resourceReference }
      : {}),
    ...(parentExperienceReference !== undefined &&
    parentExperienceReference.length > 0
      ? { parentExperienceReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
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
