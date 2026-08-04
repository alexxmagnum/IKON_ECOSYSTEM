import type {
  Analytics,
  AnalyticsKind,
  AnalyticsStatus,
  CreateAnalyticsInput,
} from "./analytics";
import {
  ANALYTICS_STATUSES,
  isAnalyticsKind,
  isAnalyticsStatus,
} from "./analytics";

let analyticsSequence = 0;

export interface CreateAnalyticsOptions {
  /**
   * When set, analytics may only be created for this ambit
   * (cross-context isolation).
   */
  contextReference?: string;
}

/**
 * Build a checked Analytics (in-memory — analytical capacity existence only).
 * Does not create measurable values, present information, or observe systems.
 */
export function createAnalytics(
  input: CreateAnalyticsInput,
  options: CreateAnalyticsOptions = {},
): Analytics {
  const contextReference = input.contextReference?.trim();
  const actorReference = input.actorReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const measurementReference = input.measurementReference?.trim();
  const eventReference = input.eventReference?.trim();
  const dimensionReference = input.dimensionReference?.trim();
  const parentAnalyticsReference = input.parentAnalyticsReference?.trim();
  const boundContext = options.contextReference?.trim() || undefined;

  if (!isAnalyticsKind(input.analyticsKind)) {
    throw new Error(
      `Unknown analytics kind: ${String(input.analyticsKind)}`,
    );
  }

  const analyticsStatus: AnalyticsStatus =
    input.analyticsStatus ?? ANALYTICS_STATUSES.Draft;
  if (!isAnalyticsStatus(analyticsStatus)) {
    throw new Error(
      `Unknown analytics status: ${String(input.analyticsStatus)}`,
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
  if (input.measurementReference !== undefined && !measurementReference) {
    throw new Error("measurementReference must not be empty when provided");
  }
  if (input.eventReference !== undefined && !eventReference) {
    throw new Error("eventReference must not be empty when provided");
  }
  if (input.dimensionReference !== undefined && !dimensionReference) {
    throw new Error("dimensionReference must not be empty when provided");
  }
  if (
    input.parentAnalyticsReference !== undefined &&
    !parentAnalyticsReference
  ) {
    throw new Error(
      "parentAnalyticsReference must not be empty when provided",
    );
  }

  if (
    boundContext !== undefined &&
    (contextReference === undefined || contextReference !== boundContext)
  ) {
    throw new Error("analytics does not apply to this scope");
  }

  const providedReference = input.analyticsReference?.trim() ?? "";
  if (input.analyticsReference !== undefined && !providedReference) {
    throw new Error("analyticsReference must not be empty when provided");
  }

  const analyticsKind: AnalyticsKind = input.analyticsKind;
  const analyticsReference =
    providedReference || allocateAnalyticsReference();

  return {
    analyticsReference,
    analyticsKind,
    analyticsStatus,
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
    ...(measurementReference !== undefined && measurementReference.length > 0
      ? { measurementReference }
      : {}),
    ...(eventReference !== undefined && eventReference.length > 0
      ? { eventReference }
      : {}),
    ...(dimensionReference !== undefined && dimensionReference.length > 0
      ? { dimensionReference }
      : {}),
    ...(parentAnalyticsReference !== undefined &&
    parentAnalyticsReference.length > 0
      ? { parentAnalyticsReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateAnalyticsReference(): string {
  analyticsSequence += 1;
  return `analytics-${analyticsSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetAnalyticsReferenceSequence(): void {
  analyticsSequence = 0;
}
