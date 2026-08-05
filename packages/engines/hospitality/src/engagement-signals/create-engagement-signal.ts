import type {
  CreateEngagementSignalInput,
  EngagementSignalKind,
  EngagementSignalStatus,
  HospitalityEngagementSignal,
} from "./engagement-signal";
import {
  ENGAGEMENT_SIGNAL_STATUSES,
  isEngagementSignalKind,
  isEngagementSignalStatus,
} from "./engagement-signal";

let engagementSignalSequence = 0;

export interface CreateEngagementSignalOptions {
  /**
   * When set, engagement signal may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementSignal (in-memory — observable fact only).
 * Does not interpret context, derive outcomes, spawn proposals, or start side effects.
 */
export function createEngagementSignal(
  input: CreateEngagementSignalInput,
  options: CreateEngagementSignalOptions = {},
): HospitalityEngagementSignal {
  const hospitalityReference = input.hospitalityReference?.trim();
  const engagementReference = input.engagementReference?.trim();
  const memberReference = input.memberReference?.trim();
  const communityReference = input.communityReference?.trim();
  const activityReference = input.activityReference?.trim();
  const suggestionReference = input.suggestionReference?.trim();
  const ruleReference = input.ruleReference?.trim();
  const contextReference = input.contextReference?.trim();
  const sourceReference = input.sourceReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementSignalKind(input.signalKind)) {
    throw new Error(
      `Unknown engagement-signal kind: ${String(input.signalKind)}`,
    );
  }

  const signalStatus: EngagementSignalStatus =
    input.signalStatus ?? ENGAGEMENT_SIGNAL_STATUSES.Draft;
  if (!isEngagementSignalStatus(signalStatus)) {
    throw new Error(
      `Unknown engagement-signal status: ${String(input.signalStatus)}`,
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
  if (input.memberReference !== undefined && !memberReference) {
    throw new Error("memberReference must not be empty when provided");
  }
  if (input.communityReference !== undefined && !communityReference) {
    throw new Error("communityReference must not be empty when provided");
  }
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (input.suggestionReference !== undefined && !suggestionReference) {
    throw new Error(
      "suggestionReference must not be empty when provided",
    );
  }
  if (input.ruleReference !== undefined && !ruleReference) {
    throw new Error("ruleReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.sourceReference !== undefined && !sourceReference) {
    throw new Error("sourceReference must not be empty when provided");
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement signal does not apply to this hospitality business",
    );
  }

  const providedReference = input.signalReference?.trim() ?? "";
  if (input.signalReference !== undefined && !providedReference) {
    throw new Error("signalReference must not be empty when provided");
  }

  const signalKind: EngagementSignalKind = input.signalKind;
  const signalReference =
    providedReference || allocateEngagementSignalReference();

  return {
    signalReference,
    signalKind,
    signalStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(engagementReference !== undefined && engagementReference.length > 0
      ? { engagementReference }
      : {}),
    ...(memberReference !== undefined && memberReference.length > 0
      ? { memberReference }
      : {}),
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(suggestionReference !== undefined && suggestionReference.length > 0
      ? { suggestionReference }
      : {}),
    ...(ruleReference !== undefined && ruleReference.length > 0
      ? { ruleReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(sourceReference !== undefined && sourceReference.length > 0
      ? { sourceReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementSignalReference(): string {
  engagementSignalSequence += 1;
  return `engagement-signal-${engagementSignalSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementSignalReferenceSequence(): void {
  engagementSignalSequence = 0;
}
