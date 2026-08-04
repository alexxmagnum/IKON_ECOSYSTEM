import type {
  CreateRecommendationInput,
  Recommendation,
  RecommendationKind,
  RecommendationStatus,
} from "./recommendation";
import {
  RECOMMENDATION_FIND_REF_KEY,
  RECOMMENDATION_STATUSES,
  isRecommendationKind,
  isRecommendationStatus,
} from "./recommendation";

let recommendationSequence = 0;

export interface CreateRecommendationOptions {
  /**
   * When set, recommendation may only be created for this ambit
   * (cross-context isolation).
   */
  contextReference?: string;
}

/**
 * Build a checked Recommendation (in-memory — suggestion existence only).
 * Does not compute suggestions, sort results, or open live suggest clients.
 */
export function createRecommendation(
  input: CreateRecommendationInput,
  options: CreateRecommendationOptions = {},
): Recommendation {
  const contextReference = input.contextReference?.trim();
  const actorReference = input.actorReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const catalogReference = input.catalogReference?.trim();
  const findRaw = input[RECOMMENDATION_FIND_REF_KEY];
  const findReference =
    typeof findRaw === "string" ? findRaw.trim() : undefined;
  const sourceReference = input.sourceReference?.trim();
  const parentRecommendationReference =
    input.parentRecommendationReference?.trim();
  const boundContext = options.contextReference?.trim() || undefined;

  if (!isRecommendationKind(input.recommendationKind)) {
    throw new Error(
      `Unknown recommendation kind: ${String(input.recommendationKind)}`,
    );
  }

  const recommendationStatus: RecommendationStatus =
    input.recommendationStatus ?? RECOMMENDATION_STATUSES.Draft;
  if (!isRecommendationStatus(recommendationStatus)) {
    throw new Error(
      `Unknown recommendation status: ${String(input.recommendationStatus)}`,
    );
  }

  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (input.catalogReference !== undefined && !catalogReference) {
    throw new Error("catalogReference must not be empty when provided");
  }
  if (findRaw !== undefined && !findReference) {
    throw new Error(
      `${RECOMMENDATION_FIND_REF_KEY} must not be empty when provided`,
    );
  }
  if (input.sourceReference !== undefined && !sourceReference) {
    throw new Error("sourceReference must not be empty when provided");
  }
  if (
    input.parentRecommendationReference !== undefined &&
    !parentRecommendationReference
  ) {
    throw new Error(
      "parentRecommendationReference must not be empty when provided",
    );
  }

  if (
    boundContext !== undefined &&
    (contextReference === undefined || contextReference !== boundContext)
  ) {
    throw new Error("recommendation does not apply to this scope");
  }

  const providedReference = input.recommendationReference?.trim() ?? "";
  if (input.recommendationReference !== undefined && !providedReference) {
    throw new Error(
      "recommendationReference must not be empty when provided",
    );
  }

  const recommendationKind: RecommendationKind = input.recommendationKind;
  const recommendationReference =
    providedReference || allocateRecommendationReference();

  return {
    recommendationReference,
    recommendationKind,
    recommendationStatus,
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(catalogReference !== undefined && catalogReference.length > 0
      ? { catalogReference }
      : {}),
    ...(findReference !== undefined && findReference.length > 0
      ? { [RECOMMENDATION_FIND_REF_KEY]: findReference }
      : {}),
    ...(sourceReference !== undefined && sourceReference.length > 0
      ? { sourceReference }
      : {}),
    ...(parentRecommendationReference !== undefined &&
    parentRecommendationReference.length > 0
      ? { parentRecommendationReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateRecommendationReference(): string {
  recommendationSequence += 1;
  return `recommendation-${recommendationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetRecommendationReferenceSequence(): void {
  recommendationSequence = 0;
}
