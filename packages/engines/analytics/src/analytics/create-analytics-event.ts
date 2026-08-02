import type {
  AnalyticsEvent,
  AnalyticsKind,
  AnalyticsStatus,
  CreateAnalyticsEventInput,
} from "./analytics-event";
import {
  ANALYTICS_STATUSES,
  isAnalyticsKind,
  isAnalyticsStatus,
} from "./analytics-event";

let analyticsSequence = 0;

export interface CreateAnalyticsEventOptions {
  /**
   * When set, analytics event may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated AnalyticsEvent (in-memory — signal / context only).
 * Does not persist, open vendor sessions, or produce visual reports.
 */
export function createAnalyticsEvent(
  input: CreateAnalyticsEventInput,
  options: CreateAnalyticsEventOptions = {},
): AnalyticsEvent {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const entityReference = input.entityReference?.trim();
  const entityKind = input.entityKind?.trim();
  const sourceReference = input.sourceReference?.trim();
  const metricReference = input.metricReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
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

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.entityReference !== undefined && !entityReference) {
    throw new Error("entityReference must not be empty when provided");
  }
  if (input.entityKind !== undefined && !entityKind) {
    throw new Error("entityKind must not be empty when provided");
  }
  if (input.sourceReference !== undefined && !sourceReference) {
    throw new Error("sourceReference must not be empty when provided");
  }
  if (input.metricReference !== undefined && !metricReference) {
    throw new Error("metricReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("analytics event does not apply to this tenant");
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
    tenantReference,
    analyticsKind,
    analyticsStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(entityReference !== undefined && entityReference.length > 0
      ? { entityReference }
      : {}),
    ...(entityKind !== undefined && entityKind.length > 0
      ? { entityKind }
      : {}),
    ...(sourceReference !== undefined && sourceReference.length > 0
      ? { sourceReference }
      : {}),
    ...(metricReference !== undefined && metricReference.length > 0
      ? { metricReference }
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
