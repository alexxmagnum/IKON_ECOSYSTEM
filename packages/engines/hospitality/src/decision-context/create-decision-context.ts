import type {
  CreateEngagementDecisionContextInput,
  EngagementDecisionContextKind,
  EngagementDecisionContextStatus,
  HospitalityEngagementDecisionContext,
} from "./decision-context";
import {
  ENGAGEMENT_DECISION_CONTEXT_STATUSES,
  isEngagementDecisionContextKind,
  isEngagementDecisionContextStatus,
} from "./decision-context";

let engagementDecisionContextSequence = 0;

export interface CreateEngagementDecisionContextOptions {
  /**
   * When set, decision context may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementDecisionContext (in-memory — frame only).
 * Does not evaluate frames, derive outcomes, spawn proposals, or start side effects.
 */
export function createEngagementDecisionContext(
  input: CreateEngagementDecisionContextInput,
  options: CreateEngagementDecisionContextOptions = {},
): HospitalityEngagementDecisionContext {
  const hospitalityReference = input.hospitalityReference?.trim();
  const engagementReference = input.engagementReference?.trim();
  const signalReference = input.signalReference?.trim();
  const ruleReference = input.ruleReference?.trim();
  const suggestionReference = input.suggestionReference?.trim();
  const activityReference = input.activityReference?.trim();
  const memberReference = input.memberReference?.trim();
  const communityReference = input.communityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentDecisionContextReference =
    input.parentDecisionContextReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementDecisionContextKind(input.decisionContextKind)) {
    throw new Error(
      `Unknown engagement-decision-context kind: ${String(input.decisionContextKind)}`,
    );
  }

  const decisionContextStatus: EngagementDecisionContextStatus =
    input.decisionContextStatus ?? ENGAGEMENT_DECISION_CONTEXT_STATUSES.Draft;
  if (!isEngagementDecisionContextStatus(decisionContextStatus)) {
    throw new Error(
      `Unknown engagement-decision-context status: ${String(input.decisionContextStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.engagementReference !== undefined && !engagementReference) {
    throw new Error(
      "engagementReference must not be empty when provided",
    );
  }
  if (input.signalReference !== undefined && !signalReference) {
    throw new Error("signalReference must not be empty when provided");
  }
  if (input.ruleReference !== undefined && !ruleReference) {
    throw new Error("ruleReference must not be empty when provided");
  }
  if (input.suggestionReference !== undefined && !suggestionReference) {
    throw new Error(
      "suggestionReference must not be empty when provided",
    );
  }
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (input.memberReference !== undefined && !memberReference) {
    throw new Error("memberReference must not be empty when provided");
  }
  if (input.communityReference !== undefined && !communityReference) {
    throw new Error("communityReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (
    input.parentDecisionContextReference !== undefined &&
    !parentDecisionContextReference
  ) {
    throw new Error(
      "parentDecisionContextReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement decision context does not apply to this hospitality business",
    );
  }

  const providedReference = input.decisionContextReference?.trim() ?? "";
  if (input.decisionContextReference !== undefined && !providedReference) {
    throw new Error(
      "decisionContextReference must not be empty when provided",
    );
  }

  const decisionContextKind: EngagementDecisionContextKind =
    input.decisionContextKind;
  const decisionContextReference =
    providedReference || allocateEngagementDecisionContextReference();

  return {
    decisionContextReference,
    decisionContextKind,
    decisionContextStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(engagementReference !== undefined && engagementReference.length > 0
      ? { engagementReference }
      : {}),
    ...(signalReference !== undefined && signalReference.length > 0
      ? { signalReference }
      : {}),
    ...(ruleReference !== undefined && ruleReference.length > 0
      ? { ruleReference }
      : {}),
    ...(suggestionReference !== undefined && suggestionReference.length > 0
      ? { suggestionReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(memberReference !== undefined && memberReference.length > 0
      ? { memberReference }
      : {}),
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentDecisionContextReference !== undefined &&
    parentDecisionContextReference.length > 0
      ? { parentDecisionContextReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementDecisionContextReference(): string {
  engagementDecisionContextSequence += 1;
  return `engagement-decision-context-${engagementDecisionContextSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementDecisionContextReferenceSequence(): void {
  engagementDecisionContextSequence = 0;
}
