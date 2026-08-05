import type {
  CreateEngagementExecutionCapabilityInput,
  EngagementExecutionCapabilityKind,
  EngagementExecutionCapabilityStatus,
  HospitalityEngagementExecutionCapability,
} from "./execution-capability";
import {
  ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES,
  isEngagementExecutionCapabilityKind,
  isEngagementExecutionCapabilityStatus,
} from "./execution-capability";

let engagementExecutionCapabilitySequence = 0;

export interface CreateEngagementExecutionCapabilityOptions {
  /**
   * When set, execution capability may only be created for this hospitality
   * business (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementExecutionCapability (in-memory — availability only).
 * Does not perform outcomes, spawn pipelines, or invent remote hooks.
 */
export function createEngagementExecutionCapability(
  input: CreateEngagementExecutionCapabilityInput,
  options: CreateEngagementExecutionCapabilityOptions = {},
): HospitalityEngagementExecutionCapability {
  const hospitalityReference = input.hospitalityReference?.trim();
  const executionContextReference = input.executionContextReference?.trim();
  const executionIntentReference = input.executionIntentReference?.trim();
  const constraintReference = input.constraintReference?.trim();
  const boundaryReference = input.boundaryReference?.trim();
  const actionIntentReference = input.actionIntentReference?.trim();
  const memberReference = input.memberReference?.trim();
  const communityReference = input.communityReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const providerReference = input.providerReference?.trim();
  const parentCapabilityReference = input.parentCapabilityReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementExecutionCapabilityKind(input.executionCapabilityKind)) {
    throw new Error(
      `Unknown engagement-execution-capability kind: ${String(input.executionCapabilityKind)}`,
    );
  }

  const executionCapabilityStatus: EngagementExecutionCapabilityStatus =
    input.executionCapabilityStatus ??
    ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES.Draft;
  if (!isEngagementExecutionCapabilityStatus(executionCapabilityStatus)) {
    throw new Error(
      `Unknown engagement-execution-capability status: ${String(input.executionCapabilityStatus)}`,
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
  if (input.constraintReference !== undefined && !constraintReference) {
    throw new Error(
      "constraintReference must not be empty when provided",
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
  if (input.providerReference !== undefined && !providerReference) {
    throw new Error("providerReference must not be empty when provided");
  }
  if (
    input.parentCapabilityReference !== undefined &&
    !parentCapabilityReference
  ) {
    throw new Error(
      "parentCapabilityReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement execution capability does not apply to this hospitality business",
    );
  }

  const providedReference = input.executionCapabilityReference?.trim() ?? "";
  if (
    input.executionCapabilityReference !== undefined &&
    !providedReference
  ) {
    throw new Error(
      "executionCapabilityReference must not be empty when provided",
    );
  }

  const executionCapabilityKind: EngagementExecutionCapabilityKind =
    input.executionCapabilityKind;
  const executionCapabilityReference =
    providedReference || allocateEngagementExecutionCapabilityReference();

  return {
    executionCapabilityReference,
    executionCapabilityKind,
    executionCapabilityStatus,
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
    ...(constraintReference !== undefined && constraintReference.length > 0
      ? { constraintReference }
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
    ...(providerReference !== undefined && providerReference.length > 0
      ? { providerReference }
      : {}),
    ...(parentCapabilityReference !== undefined &&
    parentCapabilityReference.length > 0
      ? { parentCapabilityReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementExecutionCapabilityReference(): string {
  engagementExecutionCapabilitySequence += 1;
  return `engagement-execution-capability-${engagementExecutionCapabilitySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementExecutionCapabilityReferenceSequence(): void {
  engagementExecutionCapabilitySequence = 0;
}
