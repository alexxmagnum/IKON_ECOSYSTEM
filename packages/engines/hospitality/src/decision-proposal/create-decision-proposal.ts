import type {
  CreateEngagementDecisionProposalInput,
  EngagementDecisionProposalKind,
  EngagementDecisionProposalStatus,
  HospitalityEngagementDecisionProposal,
} from "./decision-proposal";
import {
  ENGAGEMENT_DECISION_PROPOSAL_STATUSES,
  isEngagementDecisionProposalKind,
  isEngagementDecisionProposalStatus,
} from "./decision-proposal";

let engagementDecisionProposalSequence = 0;

export interface CreateEngagementDecisionProposalOptions {
  /**
   * When set, decision proposal may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementDecisionProposal (in-memory — possibility only).
 * Does not approve proposals, convert entities, spawn side effects, or invent outcomes.
 */
export function createEngagementDecisionProposal(
  input: CreateEngagementDecisionProposalInput,
  options: CreateEngagementDecisionProposalOptions = {},
): HospitalityEngagementDecisionProposal {
  const hospitalityReference = input.hospitalityReference?.trim();
  const decisionContextReference = input.decisionContextReference?.trim();
  const signalReference = input.signalReference?.trim();
  const ruleReference = input.ruleReference?.trim();
  const suggestionReference = input.suggestionReference?.trim();
  const activityReference = input.activityReference?.trim();
  const communityReference = input.communityReference?.trim();
  const memberReference = input.memberReference?.trim();
  const contextReference = input.contextReference?.trim();
  const creatorReference = input.creatorReference?.trim();
  const parentProposalReference = input.parentProposalReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementDecisionProposalKind(input.proposalKind)) {
    throw new Error(
      `Unknown engagement-decision-proposal kind: ${String(input.proposalKind)}`,
    );
  }

  const proposalStatus: EngagementDecisionProposalStatus =
    input.proposalStatus ?? ENGAGEMENT_DECISION_PROPOSAL_STATUSES.Draft;
  if (!isEngagementDecisionProposalStatus(proposalStatus)) {
    throw new Error(
      `Unknown engagement-decision-proposal status: ${String(input.proposalStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (
    input.decisionContextReference !== undefined &&
    !decisionContextReference
  ) {
    throw new Error(
      "decisionContextReference must not be empty when provided",
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
  if (input.communityReference !== undefined && !communityReference) {
    throw new Error("communityReference must not be empty when provided");
  }
  if (input.memberReference !== undefined && !memberReference) {
    throw new Error("memberReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.creatorReference !== undefined && !creatorReference) {
    throw new Error("creatorReference must not be empty when provided");
  }
  if (
    input.parentProposalReference !== undefined &&
    !parentProposalReference
  ) {
    throw new Error(
      "parentProposalReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement decision proposal does not apply to this hospitality business",
    );
  }

  const providedReference = input.proposalReference?.trim() ?? "";
  if (input.proposalReference !== undefined && !providedReference) {
    throw new Error("proposalReference must not be empty when provided");
  }

  const proposalKind: EngagementDecisionProposalKind = input.proposalKind;
  const proposalReference =
    providedReference || allocateEngagementDecisionProposalReference();

  return {
    proposalReference,
    proposalKind,
    proposalStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(decisionContextReference !== undefined &&
    decisionContextReference.length > 0
      ? { decisionContextReference }
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
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(memberReference !== undefined && memberReference.length > 0
      ? { memberReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(creatorReference !== undefined && creatorReference.length > 0
      ? { creatorReference }
      : {}),
    ...(parentProposalReference !== undefined &&
    parentProposalReference.length > 0
      ? { parentProposalReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementDecisionProposalReference(): string {
  engagementDecisionProposalSequence += 1;
  return `engagement-decision-proposal-${engagementDecisionProposalSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementDecisionProposalReferenceSequence(): void {
  engagementDecisionProposalSequence = 0;
}
