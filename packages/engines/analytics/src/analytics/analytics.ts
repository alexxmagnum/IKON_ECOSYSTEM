/**
 * Analytics Boundary — analytical capability representation (“what analytical capacity exists”)
 * (not measurable-value creation, presentation layers, or technical observation engines).
 *
 * @see DEC-ANALYTICS-BOUNDARY-001
 */

/** Internal analytics kinds — not presentation or observation catalogs. */
export const ANALYTICS_KINDS = {
  /** Commercial / business analytical capacity. */
  Business: "analytics.business",
  /**
   * Analytics initiated by an Analytics system operation.
   * Not a technical platform problem.
   */
  Operational: "analytics.operational",
  /** Experience analytical capacity. */
  Experience: "analytics.experience",
  /** Domain analytical capacity. */
  Domain: "analytics.domain",
  /** Internal MotanOS system analytical capacity. */
  System: "analytics.system",
  /** Customer-facing analytical capacity. */
  Customer: "analytics.customer",
  /** Performance-oriented analytical capacity. */
  Performance: "analytics.performance",
} as const;

export type AnalyticsKind =
  (typeof ANALYTICS_KINDS)[keyof typeof ANALYTICS_KINDS];

export const ANALYTICS_KIND_VALUES = Object.values(
  ANALYTICS_KINDS,
) as readonly AnalyticsKind[];

/** Analytics status — not presentation or observation keep-alive state. */
export const ANALYTICS_STATUSES = {
  Draft: "draft",
  Active: "active",
  Configured: "configured",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type AnalyticsStatus =
  (typeof ANALYTICS_STATUSES)[keyof typeof ANALYTICS_STATUSES];

export const ANALYTICS_STATUS_VALUES = Object.values(
  ANALYTICS_STATUSES,
) as readonly AnalyticsStatus[];

/**
 * Opaque analytics — analytical capacity existence only.
 * No presentation payloads or technical observation fields.
 */
export type Analytics = {
  /** Opaque unique analytics reference. */
  analyticsReference: string;
  /** Internal analytics kind. */
  analyticsKind: AnalyticsKind;
  /** Analytics status. */
  analyticsStatus: AnalyticsStatus;
  /** Opaque ambit pointer when known. */
  contextReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque entity pointer when known. */
  entityReference?: string;
  /** Opaque entity kind label when known. */
  entityKind?: string;
  /** Opaque measurable-value pointer when known. */
  measurementReference?: string;
  /** Opaque occurrence pointer when known. */
  eventReference?: string;
  /** Opaque dimension pointer when known. */
  dimensionReference?: string;
  /** Opaque parent analytics pointer when nested. */
  parentAnalyticsReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future analytics adapters.
 * Not wired in this foundation — no compute, present, or observe methods.
 */
export interface AnalyticsPort {
  createAnalytics(input: CreateAnalyticsInput): Promise<Analytics>;
  resolveAnalytics(analytics: Analytics): Promise<Analytics>;
}

export type CreateAnalyticsInput = {
  analyticsKind: AnalyticsKind;
  analyticsStatus?: AnalyticsStatus;
  analyticsReference?: string;
  contextReference?: string;
  actorReference?: string;
  entityReference?: string;
  entityKind?: string;
  measurementReference?: string;
  eventReference?: string;
  dimensionReference?: string;
  parentAnalyticsReference?: string;
  metadata?: Record<string, unknown>;
};

export function isAnalyticsKind(value: string): value is AnalyticsKind {
  return (ANALYTICS_KIND_VALUES as readonly string[]).includes(value);
}

export function isAnalyticsStatus(value: string): value is AnalyticsStatus {
  return (ANALYTICS_STATUS_VALUES as readonly string[]).includes(value);
}

function optionalOpaqueOk(
  candidate: Record<string, unknown>,
  key: string,
): boolean {
  const raw = candidate[key];
  return (
    raw === undefined || (typeof raw === "string" && raw.length > 0)
  );
}

export function isAnalytics(value: unknown): value is Analytics {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.analyticsReference === "string" &&
    candidate.analyticsReference.length > 0 &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "entityReference") &&
    optionalOpaqueOk(candidate, "entityKind") &&
    optionalOpaqueOk(candidate, "measurementReference") &&
    optionalOpaqueOk(candidate, "eventReference") &&
    optionalOpaqueOk(candidate, "dimensionReference") &&
    optionalOpaqueOk(candidate, "parentAnalyticsReference") &&
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
    typeof (value as AnalyticsPort).createAnalytics === "function" &&
    typeof (value as AnalyticsPort).resolveAnalytics === "function"
  );
}
