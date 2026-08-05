import type {
  CreateEngagementActionIntentInput,
  EngagementActionIntentKind,
  EngagementActionIntentStatus,
  HospitalityEngagementActionIntent,
} from "./action-intent";
import {
  ENGAGEMENT_ACTION_INTENT_STATUSES,
  isEngagementActionIntentKind,
  isEngagementActionIntentStatus,
} from "./action-intent";

let engagementActionIntentSequence = 0;

export interface CreateEngagementActionIntentOptions {
  /**
   * When set, action intent may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementActionIntent (in-memory — future intent only).
 * Does not perform outcomes, spawn pipelines, or invent remote hooks.
 */
export function createEngagementActionIntent(
  input: CreateEngagementActionIntentInput,
  options: CreateEngagementActionIntentOptions = {},
): HospitalityEngagementActionIntent {
  const hospitalityReference = input.hospitalityReference?.trim();
  const approvalReference = input.approvalReference?.trim();
  const proposalReference = input.proposalReference?.trim();
  const decisionContextReference = input.decisionContextReference?.trim();
  const activityReference = input.activityReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const communityReference = input.communityReference?.trim();
  const memberReference = input.memberReference?.trim();
  const contextReference = input.contextReference?.trim();
  const creatorReference = input.creatorReference?.trim();
  const parentIntentReference = input.parentIntentReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementActionIntentKind(input.intentKind)) {
    throw new Error(
      `Unknown engagement-action-intent kind: ${String(input.intentKind)}`,
    );
  }

  const intentStatus: EngagementActionIntentStatus =
    input.intentStatus ?? ENGAGEMENT_ACTION_INTENT_STATUSES.Draft;
  if (!isEngagementActionIntentStatus(intentStatus)) {
    throw new Error(
      `Unknown engagement-action-intent status: ${String(input.intentStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.approvalReference !== undefined && !approvalReference) {
    throw new Error("approvalReference must not be empty when provided");
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
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error(
      "experienceReference must not be empty when provided",
    );
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
    input.parentIntentReference !== undefined &&
    !parentIntentReference
  ) {
    throw new Error(
      "parentIntentReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement action intent does not apply to this hospitality business",
    );
  }

  const providedReference = input.intentReference?.trim() ?? "";
  if (input.intentReference !== undefined && !providedReference) {
    throw new Error("intentReference must not be empty when provided");
  }

  const intentKind: EngagementActionIntentKind = input.intentKind;
  const intentReference =
    providedReference || allocateEngagementActionIntentReference();

  return {
    intentReference,
    intentKind,
    intentStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(approvalReference !== undefined && approvalReference.length > 0
      ? { approvalReference }
      : {}),
    ...(proposalReference !== undefined && proposalReference.length > 0
      ? { proposalReference }
      : {}),
    ...(decisionContextReference !== undefined &&
    decisionContextReference.length > 0
      ? { decisionContextReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
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
    ...(parentIntentReference !== undefined &&
    parentIntentReference.length > 0
      ? { parentIntentReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementActionIntentReference(): string {
  engagementActionIntentSequence += 1;
  return `engagement-action-intent-${engagementActionIntentSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementActionIntentReferenceSequence(): void {
  engagementActionIntentSequence = 0;
}
