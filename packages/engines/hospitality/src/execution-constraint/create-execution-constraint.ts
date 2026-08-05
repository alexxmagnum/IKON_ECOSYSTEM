import type {
  CreateEngagementExecutionConstraintInput,
  EngagementExecutionConstraintKind,
  EngagementExecutionConstraintStatus,
  HospitalityEngagementExecutionConstraint,
} from "./execution-constraint";
import {
  ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES,
  isEngagementExecutionConstraintKind,
  isEngagementExecutionConstraintStatus,
} from "./execution-constraint";

let engagementExecutionConstraintSequence = 0;

export interface CreateEngagementExecutionConstraintOptions {
  /**
   * When set, execution constraint may only be created for this hospitality
   * business (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementExecutionConstraint (in-memory — descriptor only).
 * Does not impose limits, spawn pipelines, or invent remote hooks.
 */
export function createEngagementExecutionConstraint(
  input: CreateEngagementExecutionConstraintInput,
  options: CreateEngagementExecutionConstraintOptions = {},
): HospitalityEngagementExecutionConstraint {
  const hospitalityReference = input.hospitalityReference?.trim();
  const executionContextReference = input.executionContextReference?.trim();
  const executionIntentReference = input.executionIntentReference?.trim();
  const boundaryReference = input.boundaryReference?.trim();
  const actionIntentReference = input.actionIntentReference?.trim();
  const memberReference = input.memberReference?.trim();
  const communityReference = input.communityReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const parentConstraintReference = input.parentConstraintReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementExecutionConstraintKind(input.executionConstraintKind)) {
    throw new Error(
      `Unknown engagement-execution-constraint kind: ${String(input.executionConstraintKind)}`,
    );
  }

  const executionConstraintStatus: EngagementExecutionConstraintStatus =
    input.executionConstraintStatus ??
    ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES.Draft;
  if (!isEngagementExecutionConstraintStatus(executionConstraintStatus)) {
    throw new Error(
      `Unknown engagement-execution-constraint status: ${String(input.executionConstraintStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (
    input.executionContextReference !== undefined &&
    !executionContextReference
  ) {
    throw new Error(
      "executionContextReference must not be empty when provided",
    );
  }
  if (
    input.executionIntentReference !== undefined &&
    !executionIntentReference
  ) {
    throw new Error(
      "executionIntentReference must not be empty when provided",
    );
  }
  if (input.boundaryReference !== undefined && !boundaryReference) {
    throw new Error("boundaryReference must not be empty when provided");
  }
  if (input.actionIntentReference !== undefined && !actionIntentReference) {
    throw new Error(
      "actionIntentReference must not be empty when provided",
    );
  }
  if (input.memberReference !== undefined && !memberReference) {
    throw new Error("memberReference must not be empty when provided");
  }
  if (input.communityReference !== undefined && !communityReference) {
    throw new Error("communityReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error(
      "experienceReference must not be empty when provided",
    );
  }
  if (
    input.parentConstraintReference !== undefined &&
    !parentConstraintReference
  ) {
    throw new Error(
      "parentConstraintReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement execution constraint does not apply to this hospitality business",
    );
  }

  const providedReference = input.executionConstraintReference?.trim() ?? "";
  if (
    input.executionConstraintReference !== undefined &&
    !providedReference
  ) {
    throw new Error(
      "executionConstraintReference must not be empty when provided",
    );
  }

  const executionConstraintKind: EngagementExecutionConstraintKind =
    input.executionConstraintKind;
  const executionConstraintReference =
    providedReference || allocateEngagementExecutionConstraintReference();

  return {
    executionConstraintReference,
    executionConstraintKind,
    executionConstraintStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(executionContextReference !== undefined &&
    executionContextReference.length > 0
      ? { executionContextReference }
      : {}),
    ...(executionIntentReference !== undefined &&
    executionIntentReference.length > 0
      ? { executionIntentReference }
      : {}),
    ...(boundaryReference !== undefined && boundaryReference.length > 0
      ? { boundaryReference }
      : {}),
    ...(actionIntentReference !== undefined &&
    actionIntentReference.length > 0
      ? { actionIntentReference }
      : {}),
    ...(memberReference !== undefined && memberReference.length > 0
      ? { memberReference }
      : {}),
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(parentConstraintReference !== undefined &&
    parentConstraintReference.length > 0
      ? { parentConstraintReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementExecutionConstraintReference(): string {
  engagementExecutionConstraintSequence += 1;
  return `engagement-execution-constraint-${engagementExecutionConstraintSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementExecutionConstraintReferenceSequence(): void {
  engagementExecutionConstraintSequence = 0;
}
