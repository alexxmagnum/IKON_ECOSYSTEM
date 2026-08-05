import type {
  CreateEngagementExecutionResourceInput,
  EngagementExecutionResourceKind,
  EngagementExecutionResourceStatus,
  HospitalityEngagementExecutionResource,
} from "./execution-resource";
import {
  ENGAGEMENT_EXECUTION_RESOURCE_STATUSES,
  isEngagementExecutionResourceKind,
  isEngagementExecutionResourceStatus,
} from "./execution-resource";

let engagementExecutionResourceSequence = 0;

export interface CreateEngagementExecutionResourceOptions {
  /**
   * When set, execution resource may only be created for this hospitality
   * business (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementExecutionResource (in-memory — association only).
 * Does not spend stock, hold seats, or invent remote hooks.
 */
export function createEngagementExecutionResource(
  input: CreateEngagementExecutionResourceInput,
  options: CreateEngagementExecutionResourceOptions = {},
): HospitalityEngagementExecutionResource {
  const hospitalityReference = input.hospitalityReference?.trim();
  const executionCapabilityReference =
    input.executionCapabilityReference?.trim();
  const executionContextReference = input.executionContextReference?.trim();
  const executionIntentReference = input.executionIntentReference?.trim();
  const constraintReference = input.constraintReference?.trim();
  const boundaryReference = input.boundaryReference?.trim();
  const providerReference = input.providerReference?.trim();
  const locationReference = input.locationReference?.trim();
  const memberReference = input.memberReference?.trim();
  const communityReference = input.communityReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const parentResourceReference = input.parentResourceReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementExecutionResourceKind(input.executionResourceKind)) {
    throw new Error(
      `Unknown engagement-execution-resource kind: ${String(input.executionResourceKind)}`,
    );
  }

  const executionResourceStatus: EngagementExecutionResourceStatus =
    input.executionResourceStatus ??
    ENGAGEMENT_EXECUTION_RESOURCE_STATUSES.Draft;
  if (!isEngagementExecutionResourceStatus(executionResourceStatus)) {
    throw new Error(
      `Unknown engagement-execution-resource status: ${String(input.executionResourceStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (
    input.executionCapabilityReference !== undefined &&
    !executionCapabilityReference
  ) {
    throw new Error(
      "executionCapabilityReference must not be empty when provided",
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
  if (input.providerReference !== undefined && !providerReference) {
    throw new Error("providerReference must not be empty when provided");
  }
  if (input.locationReference !== undefined && !locationReference) {
    throw new Error("locationReference must not be empty when provided");
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
    input.parentResourceReference !== undefined &&
    !parentResourceReference
  ) {
    throw new Error(
      "parentResourceReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement execution resource does not apply to this hospitality business",
    );
  }

  const providedReference = input.executionResourceReference?.trim() ?? "";
  if (input.executionResourceReference !== undefined && !providedReference) {
    throw new Error(
      "executionResourceReference must not be empty when provided",
    );
  }

  const executionResourceKind: EngagementExecutionResourceKind =
    input.executionResourceKind;
  const executionResourceReference =
    providedReference || nextEngagementExecutionResourceReference();

  return {
    executionResourceReference,
    executionResourceKind,
    executionResourceStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(executionCapabilityReference !== undefined &&
    executionCapabilityReference.length > 0
      ? { executionCapabilityReference }
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
    ...(providerReference !== undefined && providerReference.length > 0
      ? { providerReference }
      : {}),
    ...(locationReference !== undefined && locationReference.length > 0
      ? { locationReference }
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
    ...(parentResourceReference !== undefined &&
    parentResourceReference.length > 0
      ? { parentResourceReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function nextEngagementExecutionResourceReference(): string {
  engagementExecutionResourceSequence += 1;
  return `engagement-execution-resource-${engagementExecutionResourceSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementExecutionResourceReferenceSequence(): void {
  engagementExecutionResourceSequence = 0;
}
