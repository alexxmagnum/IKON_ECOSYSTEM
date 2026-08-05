import type {
  CreateEngagementSuggestionInput,
  EngagementSuggestionKind,
  EngagementSuggestionStatus,
  HospitalityEngagementSuggestion,
} from "./suggestion";
import {
  ENGAGEMENT_SUGGESTION_STATUSES,
  isEngagementSuggestionKind,
  isEngagementSuggestionStatus,
} from "./suggestion";

let engagementSuggestionSequence = 0;

export interface CreateEngagementSuggestionOptions {
  /**
   * When set, suggestion may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementSuggestion (in-memory — proposal only).
 * Does not approve proposals, convert to activities, notify owners, or generate ideas.
 */
export function createSuggestion(
  input: CreateEngagementSuggestionInput,
  options: CreateEngagementSuggestionOptions = {},
): HospitalityEngagementSuggestion {
  const hospitalityReference = input.hospitalityReference?.trim();
  const communityReference = input.communityReference?.trim();
  const actorReference = input.actorReference?.trim();
  const memberReference = input.memberReference?.trim();
  const engagementReference = input.engagementReference?.trim();
  const activityReference = input.activityReference?.trim();
  const parentSuggestionReference = input.parentSuggestionReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementSuggestionKind(input.suggestionKind)) {
    throw new Error(
      `Unknown engagement-suggestion kind: ${String(input.suggestionKind)}`,
    );
  }

  const suggestionStatus: EngagementSuggestionStatus =
    input.suggestionStatus ?? ENGAGEMENT_SUGGESTION_STATUSES.Draft;
  if (!isEngagementSuggestionStatus(suggestionStatus)) {
    throw new Error(
      `Unknown engagement-suggestion status: ${String(input.suggestionStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.communityReference !== undefined && !communityReference) {
    throw new Error("communityReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.memberReference !== undefined && !memberReference) {
    throw new Error("memberReference must not be empty when provided");
  }
  if (input.engagementReference !== undefined && !engagementReference) {
    throw new Error(
      "engagementReference must not be empty when provided",
    );
  }
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (
    input.parentSuggestionReference !== undefined &&
    !parentSuggestionReference
  ) {
    throw new Error(
      "parentSuggestionReference must not be empty when provided",
    );
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement suggestion does not apply to this hospitality business",
    );
  }

  const providedReference = input.suggestionReference?.trim() ?? "";
  if (input.suggestionReference !== undefined && !providedReference) {
    throw new Error(
      "suggestionReference must not be empty when provided",
    );
  }

  const suggestionKind: EngagementSuggestionKind = input.suggestionKind;
  const suggestionReference =
    providedReference || allocateEngagementSuggestionReference();

  return {
    suggestionReference,
    suggestionKind,
    suggestionStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(communityReference !== undefined && communityReference.length > 0
      ? { communityReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(memberReference !== undefined && memberReference.length > 0
      ? { memberReference }
      : {}),
    ...(engagementReference !== undefined && engagementReference.length > 0
      ? { engagementReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(parentSuggestionReference !== undefined &&
    parentSuggestionReference.length > 0
      ? { parentSuggestionReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementSuggestionReference(): string {
  engagementSuggestionSequence += 1;
  return `engagement-suggestion-${engagementSuggestionSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementSuggestionReferenceSequence(): void {
  engagementSuggestionSequence = 0;
}
