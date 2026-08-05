import type {
  CreateEngagementApprovalContextInput,
  EngagementApprovalContextKind,
  EngagementApprovalContextStatus,
  HospitalityEngagementApprovalContext,
} from "./approval-context";
import {
  ENGAGEMENT_APPROVAL_CONTEXT_STATUSES,
  isEngagementApprovalContextKind,
  isEngagementApprovalContextStatus,
} from "./approval-context";

let engagementApprovalContextSequence = 0;

export interface CreateEngagementApprovalContextOptions {
  /**
   * When set, approval context may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementApprovalContext (in-memory — review frame only).
 * Does not settle proposals, spawn side effects, or invent outcomes.
 */
export function createEngagementApprovalContext(
  input: CreateEngagementApprovalContextInput,
  options: CreateEngagementApprovalContextOptions = {},
): HospitalityEngagementApprovalContext {
  const hospitalityReference = input.hospitalityReference?.trim();
  const proposalReference = input.proposalReference?.trim();
  const decisionContextReference = input.decisionContextReference?.trim();
  const reviewerReference = input.reviewerReference?.trim();
  const memberReference = input.memberReference?.trim();
  const activityReference = input.activityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentApprovalReference = input.parentApprovalReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementApprovalContextKind(input.approvalKind)) {
    throw new Error(
      `Unknown engagement-approval-context kind: ${String(input.approvalKind)}`,
    );
  }

  const approvalStatus: EngagementApprovalContextStatus =
    input.approvalStatus ?? ENGAGEMENT_APPROVAL_CONTEXT_STATUSES.Draft;
  if (!isEngagementApprovalContextStatus(approvalStatus)) {
    throw new Error(
      `Unknown engagement-approval-context status: ${String(input.approvalStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.proposalReference !== undefined && !proposalReference) {
    throw new Error("proposalReference must not be empty when provided");
  }
  if (
    input.decisionContextReference !== undefined &&
    !decisionContextReference
  ) {
    throw new Error(
      "decisionContextReference must not be empty when provided",
    );
  }
  if (input.reviewerReference !== undefined && !reviewerReference) {
    throw new Error("reviewerReference must not be empty when provided");
  }
  if (input.memberReference !== undefined && !memberReference) {
    throw new Error("memberReference must not be empty when provided");
  }
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (
    input.parentApprovalReference !== undefined &&
    !parentApprovalReference
  ) {
    throw new Error(
      "parentApprovalReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement approval context does not apply to this hospitality business",
    );
  }

  const providedReference = input.approvalReference?.trim() ?? "";
  if (input.approvalReference !== undefined && !providedReference) {
    throw new Error(
      "approvalReference must not be empty when provided",
    );
  }

  const approvalKind: EngagementApprovalContextKind = input.approvalKind;
  const approvalReference =
    providedReference || allocateEngagementApprovalContextReference();

  return {
    approvalReference,
    approvalKind,
    approvalStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(proposalReference !== undefined && proposalReference.length > 0
      ? { proposalReference }
      : {}),
    ...(decisionContextReference !== undefined &&
    decisionContextReference.length > 0
      ? { decisionContextReference }
      : {}),
    ...(reviewerReference !== undefined && reviewerReference.length > 0
      ? { reviewerReference }
      : {}),
    ...(memberReference !== undefined && memberReference.length > 0
      ? { memberReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentApprovalReference !== undefined &&
    parentApprovalReference.length > 0
      ? { parentApprovalReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementApprovalContextReference(): string {
  engagementApprovalContextSequence += 1;
  return `engagement-approval-context-${engagementApprovalContextSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementApprovalContextReferenceSequence(): void {
  engagementApprovalContextSequence = 0;
}
