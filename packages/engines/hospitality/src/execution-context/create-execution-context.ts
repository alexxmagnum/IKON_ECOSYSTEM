import type {
  CreateEngagementExecutionContextInput,
  EngagementExecutionContextKind,
  EngagementExecutionContextStatus,
  HospitalityEngagementExecutionContext,
} from "./execution-context";
import {
  ENGAGEMENT_EXECUTION_CONTEXT_STATUSES,
  isEngagementExecutionContextKind,
  isEngagementExecutionContextStatus,
} from "./execution-context";

let engagementExecutionContextSequence = 0;

export interface CreateEngagementExecutionContextOptions {
  /**
   * When set, execution context may only be created for this hospitality
   * business (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementExecutionContext (in-memory — frame only).
 * Does not perform outcomes, spawn pipelines, or invent remote hooks.
 */
export function createEngagementExecutionContext(
  input: CreateEngagementExecutionContextInput,
  options: CreateEngagementExecutionContextOptions = {},
): HospitalityEngagementExecutionContext {
  const hospitalityReference = input.hospitalityReference?.trim();
  const executionIntentReference = input.executionIntentReference?.trim();
  const boundaryReference = input.boundaryReference?.trim();
  const actionIntentReference = input.actionIntentReference?.trim();
  const approvalReference = input.approvalReference?.trim();
  const proposalReference = input.proposalReference?.trim();
  const locationReference = input.locationReference?.trim();
  const memberReference = input.memberReference?.trim();
  const communityReference = input.communityReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const parentExecutionContextReference =
    input.parentExecutionContextReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementExecutionContextKind(input.executionContextKind)) {
    throw new Error(
      `Unknown engagement-execution-context kind: ${String(input.executionContextKind)}`,
    );
  }

  const executionContextStatus: EngagementExecutionContextStatus =
    input.executionContextStatus ??
    ENGAGEMENT_EXECUTION_CONTEXT_STATUSES.Draft;
  if (!isEngagementExecutionContextStatus(executionContextStatus)) {
    throw new Error(
      `Unknown engagement-execution-context status: ${String(input.executionContextStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
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
  if (input.approvalReference !== undefined && !approvalReference) {
    throw new Error("approvalReference must not be empty when provided");
  }
  if (input.proposalReference !== undefined && !proposalReference) {
    throw new Error("proposalReference must not be empty when provided");
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
    input.parentExecutionContextReference !== undefined &&
    !parentExecutionContextReference
  ) {
    throw new Error(
      "parentExecutionContextReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement execution context does not apply to this hospitality business",
    );
  }

  const providedReference = input.executionContextReference?.trim() ?? "";
  if (input.executionContextReference !== undefined && !providedReference) {
    throw new Error(
      "executionContextReference must not be empty when provided",
    );
  }

  const executionContextKind: EngagementExecutionContextKind =
    input.executionContextKind;
  const executionContextReference =
    providedReference || allocateEngagementExecutionContextReference();

  return {
    executionContextReference,
    executionContextKind,
    executionContextStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
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
    ...(approvalReference !== undefined && approvalReference.length > 0
      ? { approvalReference }
      : {}),
    ...(proposalReference !== undefined && proposalReference.length > 0
      ? { proposalReference }
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
    ...(parentExecutionContextReference !== undefined &&
    parentExecutionContextReference.length > 0
      ? { parentExecutionContextReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementExecutionContextReference(): string {
  engagementExecutionContextSequence += 1;
  return `engagement-execution-context-${engagementExecutionContextSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementExecutionContextReferenceSequence(): void {
  engagementExecutionContextSequence = 0;
}
