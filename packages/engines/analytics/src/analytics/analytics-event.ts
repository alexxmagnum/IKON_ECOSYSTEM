/**
 * Analytics Engine Boundary — measurable business signals / metric context
 * (not BI tools, visual reports, chart UIs, query engines, or metric vendors).
 *
 * @see DEC-ANALYTICS-BOUNDARY-001
 */

/** Internal analytics kinds — not vendor event catalogs. */
export const ANALYTICS_KINDS = {
  /** Feature or capability usage signal. */
  Usage: "analytics.usage",
  /** Entity lifecycle measurement signal. */
  Lifecycle: "analytics.lifecycle",
  /** Community / participation interaction signal. */
  Engagement: "analytics.engagement",
  /** Commercial progression signal. */
  Conversion: "analytics.conversion",
  /** Operational performance signal. */
  Performance: "analytics.performance",
  /**
   * Analytics initiated by an Analytics system operation.
   * Not a technical infrastructure error.
   */
  Operational: "analytics.operational",
} as const;

export type AnalyticsKind =
  (typeof ANALYTICS_KINDS)[keyof typeof ANALYTICS_KINDS];

export const ANALYTICS_KIND_VALUES = Object.values(
  ANALYTICS_KINDS,
) as readonly AnalyticsKind[];

/** Analytics event status — not storage or BI pipeline state. */
export const ANALYTICS_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Recorded: "recorded",
  Processed: "processed",
  Archived: "archived",
  Failed: "failed",
  Cancelled: "cancelled",
} as const;

export type AnalyticsStatus =
  (typeof ANALYTICS_STATUSES)[keyof typeof ANALYTICS_STATUSES];

export const ANALYTICS_STATUS_VALUES = Object.values(
  ANALYTICS_STATUSES,
) as readonly AnalyticsStatus[];

/**
 * Opaque analytics event — measurable signal and metric context only.
 * No personal data, credentials, or visitor/client identifiers.
 */
export interface AnalyticsEvent {
  /** Opaque unique analytics reference. */
  analyticsReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal analytics kind. */
  analyticsKind: AnalyticsKind;
  /** Analytics event status. */
  analyticsStatus: AnalyticsStatus;
  /** Opaque actor when known — not a live identity profile. */
  actorReference?: string;
  /** Opaque entity pointer — booking, payment, community, etc. */
  entityReference?: string;
  /** Opaque entity kind label — not a live type system. */
  entityKind?: string;
  /** Opaque source pointer when known (e.g. audit or domain event). */
  sourceReference?: string;
  /** Opaque metric pointer when known. */
  metricReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future analytics adapters (Runtime).
 * Not wired in this foundation — no vendor send, publish, query, or report.
 */
export interface AnalyticsPort {
  createAnalyticsEvent(
    input: CreateAnalyticsEventInput,
  ): Promise<AnalyticsEvent>;
  resolveAnalyticsEvent(
    analyticsEvent: AnalyticsEvent,
  ): Promise<AnalyticsEvent>;
}

export interface CreateAnalyticsEventInput {
  tenantReference: string;
  analyticsKind: AnalyticsKind;
  analyticsStatus?: AnalyticsStatus;
  analyticsReference?: string;
  actorReference?: string;
  entityReference?: string;
  entityKind?: string;
  sourceReference?: string;
  metricReference?: string;
  metadata?: Record<string, unknown>;
}

export function isAnalyticsKind(value: string): value is AnalyticsKind {
  return (ANALYTICS_KIND_VALUES as readonly string[]).includes(value);
}

export function isAnalyticsStatus(value: string): value is AnalyticsStatus {
  return (ANALYTICS_STATUS_VALUES as readonly string[]).includes(value);
}

export function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const entityOk =
    candidate.entityReference === undefined ||
    (typeof candidate.entityReference === "string" &&
      candidate.entityReference.length > 0);
  const entityKindOk =
    candidate.entityKind === undefined ||
    (typeof candidate.entityKind === "string" &&
      candidate.entityKind.length > 0);
  const sourceOk =
    candidate.sourceReference === undefined ||
    (typeof candidate.sourceReference === "string" &&
      candidate.sourceReference.length > 0);
  const metricOk =
    candidate.metricReference === undefined ||
    (typeof candidate.metricReference === "string" &&
      candidate.metricReference.length > 0);
  return (
    typeof candidate.analyticsReference === "string" &&
    candidate.analyticsReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    actorOk &&
    entityOk &&
    entityKindOk &&
    sourceOk &&
    metricOk &&
    typeof candidate.analyticsKind === "string" &&
    isAnalyticsKind(candidate.analyticsKind) &&
    typeof candidate.analyticsStatus === "string" &&
    isAnalyticsStatus(candidate.analyticsStatus)
  );
}

export function isAnalyticsPort(value: unknown): value is AnalyticsPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as AnalyticsPort).createAnalyticsEvent === "function" &&
    typeof (value as AnalyticsPort).resolveAnalyticsEvent === "function"
  );
}
