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
 * Build a checked Experience (in-memory — experience existence / context only).
 * Does not run steps, open vendor sessions, or produce suggestions.
 */
export function createExperience(
  input: CreateExperienceInput,
  options: CreateExperienceOptions = {},
): Experience {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const contextReference = input.contextReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const parentExperienceReference = input.parentExperienceReference?.trim();
  const assetReference = input.assetReference?.trim();
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
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }
  if (
    input.parentExperienceReference !== undefined &&
    !parentExperienceReference
  ) {
    throw new Error(
      "parentExperienceReference must not be empty when provided",
    );
  }
  if (input.assetReference !== undefined && !assetReference) {
    throw new Error("assetReference must not be empty when provided");
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
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(parentExperienceReference !== undefined &&
    parentExperienceReference.length > 0
      ? { parentExperienceReference }
      : {}),
    ...(assetReference !== undefined && assetReference.length > 0
      ? { assetReference }
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
