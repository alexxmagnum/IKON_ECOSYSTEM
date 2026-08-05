import type {
  CreateEngagementExecutionIntentInput,
  EngagementExecutionIntentKind,
  EngagementExecutionIntentStatus,
  HospitalityEngagementExecutionIntent,
} from "./execution-intent";
import {
  ENGAGEMENT_EXECUTION_INTENT_STATUSES,
  isEngagementExecutionIntentKind,
  isEngagementExecutionIntentStatus,
} from "./execution-intent";

let engagementExecutionIntentSequence = 0;

export interface CreateEngagementExecutionIntentOptions {
  /**
   * When set, execution intent may only be created for this hospitality
   * business (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementExecutionIntent (in-memory — intent only).
 * Does not perform outcomes, spawn pipelines, or invent remote hooks.
 */
export function createEngagementExecutionIntent(
  input: CreateEngagementExecutionIntentInput,
  options: CreateEngagementExecutionIntentOptions = {},
): HospitalityEngagementExecutionIntent {
  const hospitalityReference = input.hospitalityReference?.trim();
  const boundaryReference = input.boundaryReference?.trim();
  const actionIntentReference = input.actionIntentReference?.trim();
  const approvalReference = input.approvalReference?.trim();
  const proposalReference = input.proposalReference?.trim();
  const contextReference = input.contextReference?.trim();
  const executorReference = input.executorReference?.trim();
  const parentExecutionIntentReference =
    input.parentExecutionIntentReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementExecutionIntentKind(input.executionIntentKind)) {
    throw new Error(
      `Unknown engagement-execution-intent kind: ${String(input.executionIntentKind)}`,
    );
  }

  const executionIntentStatus: EngagementExecutionIntentStatus =
    input.executionIntentStatus ?? ENGAGEMENT_EXECUTION_INTENT_STATUSES.Draft;
  if (!isEngagementExecutionIntentStatus(executionIntentStatus)) {
    throw new Error(
      `Unknown engagement-execution-intent status: ${String(input.executionIntentStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
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
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.executorReference !== undefined && !executorReference) {
    throw new Error("executorReference must not be empty when provided");
  }
  if (
    input.parentExecutionIntentReference !== undefined &&
    !parentExecutionIntentReference
  ) {
    throw new Error(
      "parentExecutionIntentReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement execution intent does not apply to this hospitality business",
    );
  }

  const providedReference = input.executionIntentReference?.trim() ?? "";
  if (input.executionIntentReference !== undefined && !providedReference) {
    throw new Error(
      "executionIntentReference must not be empty when provided",
    );
  }

  const executionIntentKind: EngagementExecutionIntentKind =
    input.executionIntentKind;
  const executionIntentReference =
    providedReference || allocateEngagementExecutionIntentReference();

  return {
    executionIntentReference,
    executionIntentKind,
    executionIntentStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
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
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(executorReference !== undefined && executorReference.length > 0
      ? { executorReference }
      : {}),
    ...(parentExecutionIntentReference !== undefined &&
    parentExecutionIntentReference.length > 0
      ? { parentExecutionIntentReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementExecutionIntentReference(): string {
  engagementExecutionIntentSequence += 1;
  return `engagement-execution-intent-${engagementExecutionIntentSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementExecutionIntentReferenceSequence(): void {
  engagementExecutionIntentSequence = 0;
}
