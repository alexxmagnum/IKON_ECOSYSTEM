import type {
  CreateEngagementExecutionBoundaryInput,
  EngagementExecutionBoundaryKind,
  EngagementExecutionBoundaryStatus,
  HospitalityEngagementExecutionBoundary,
} from "./execution-boundary";
import {
  ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES,
  isEngagementExecutionBoundaryKind,
  isEngagementExecutionBoundaryStatus,
} from "./execution-boundary";

let engagementExecutionBoundarySequence = 0;

export interface CreateEngagementExecutionBoundaryOptions {
  /**
   * When set, execution boundary may only be created for this hospitality
   * business (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementExecutionBoundary (in-memory — handoff only).
 * Does not perform outcomes, spawn pipelines, or invent remote hooks.
 */
export function createEngagementExecutionBoundary(
  input: CreateEngagementExecutionBoundaryInput,
  options: CreateEngagementExecutionBoundaryOptions = {},
): HospitalityEngagementExecutionBoundary {
  const hospitalityReference = input.hospitalityReference?.trim();
  const intentReference = input.intentReference?.trim();
  const approvalReference = input.approvalReference?.trim();
  const proposalReference = input.proposalReference?.trim();
  const contextReference = input.contextReference?.trim();
  const executorReference = input.executorReference?.trim();
  const parentBoundaryReference = input.parentBoundaryReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementExecutionBoundaryKind(input.boundaryKind)) {
    throw new Error(
      `Unknown engagement-execution-boundary kind: ${String(input.boundaryKind)}`,
    );
  }

  const boundaryStatus: EngagementExecutionBoundaryStatus =
    input.boundaryStatus ?? ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES.Draft;
  if (!isEngagementExecutionBoundaryStatus(boundaryStatus)) {
    throw new Error(
      `Unknown engagement-execution-boundary status: ${String(input.boundaryStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.intentReference !== undefined && !intentReference) {
    throw new Error("intentReference must not be empty when provided");
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
    input.parentBoundaryReference !== undefined &&
    !parentBoundaryReference
  ) {
    throw new Error(
      "parentBoundaryReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement execution boundary does not apply to this hospitality business",
    );
  }

  const providedReference = input.boundaryReference?.trim() ?? "";
  if (input.boundaryReference !== undefined && !providedReference) {
    throw new Error("boundaryReference must not be empty when provided");
  }

  const boundaryKind: EngagementExecutionBoundaryKind = input.boundaryKind;
  const boundaryReference =
    providedReference || allocateEngagementExecutionBoundaryReference();

  return {
    boundaryReference,
    boundaryKind,
    boundaryStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(intentReference !== undefined && intentReference.length > 0
      ? { intentReference }
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
    ...(parentBoundaryReference !== undefined &&
    parentBoundaryReference.length > 0
      ? { parentBoundaryReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementExecutionBoundaryReference(): string {
  engagementExecutionBoundarySequence += 1;
  return `engagement-execution-boundary-${engagementExecutionBoundarySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementExecutionBoundaryReferenceSequence(): void {
  engagementExecutionBoundarySequence = 0;
}
