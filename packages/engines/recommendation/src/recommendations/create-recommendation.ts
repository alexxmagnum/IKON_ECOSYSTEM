import type {
  CreateRecommendationInput,
  Recommendation,
  RecommendationKind,
  RecommendationStatus,
} from "./recommendation";
import {
  RECOMMENDATION_STATUSES,
  isRecommendationKind,
  isRecommendationStatus,
} from "./recommendation";

let recommendationSequence = 0;

export interface CreateRecommendationOptions {
  /**
   * When set, recommendation may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a checked Recommendation (in-memory — suggestion / context only).
 * Does not open vendor sessions or compute suggestions.
 */
export function createRecommendation(
  input: CreateRecommendationInput,
  options: CreateRecommendationOptions = {},
): Recommendation {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const targetReference = input.targetReference?.trim();
  const targetKind = input.targetKind?.trim();
  const contextReference = input.contextReference?.trim();
  const sourceReference = input.sourceReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
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

  if (input.targetReference !== undefined && !targetReference) {
    throw new Error("targetReference must not be empty when provided");
  }
  if (input.targetKind !== undefined && !targetKind) {
    throw new Error("targetKind must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.sourceReference !== undefined && !sourceReference) {
    throw new Error("sourceReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("recommendation does not apply to this tenant");
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
    tenantReference,
    recommendationKind,
    recommendationStatus,
    ...(targetReference !== undefined && targetReference.length > 0
      ? { targetReference }
      : {}),
    ...(targetKind !== undefined && targetKind.length > 0
      ? { targetKind }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(sourceReference !== undefined && sourceReference.length > 0
      ? { sourceReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
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
