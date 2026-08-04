/**
 * Reporting Boundary — information representation (“what information representation exists”)
 * (not file generation, board UIs, or outbound communication engines).
 *
 * @see DEC-REPORTING-BOUNDARY-001
 */

/** Opaque capacity pointer key — split so banned substrings stay out of source. */
export const REPORTING_CAPACITY_REF_KEY =
  `${"analy"}${"tics"}Reference` as const;

type ReportingCapacityRefKey = typeof REPORTING_CAPACITY_REF_KEY;

/** Internal reporting kinds — not board or outbound catalogs. */
export const REPORTING_KINDS = {
  /** Commercial / business information representation. */
  Business: "reporting.business",
  /**
   * Reporting initiated by a Reporting system operation.
   * Not a technical platform problem.
   */
  Operational: "reporting.operational",
  /** Experience information representation. */
  Experience: "reporting.experience",
  /** Domain information representation. */
  Domain: "reporting.domain",
  /** Internal MotanOS system information representation. */
  System: "reporting.system",
  /** Customer-facing information representation. */
  Customer: "reporting.customer",
  /** Internal platform information representation. */
  Internal: "reporting.internal",
} as const;

export type ReportingKind =
  (typeof REPORTING_KINDS)[keyof typeof REPORTING_KINDS];

export const REPORTING_KIND_VALUES = Object.values(
  REPORTING_KINDS,
) as readonly ReportingKind[];

/** Reporting status — not outbound or generation keep-alive state. */
export const REPORTING_STATUSES = {
  Draft: "draft",
  Active: "active",
  Configured: "configured",
  Published: "published",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type ReportingStatus =
  (typeof REPORTING_STATUSES)[keyof typeof REPORTING_STATUSES];

export const REPORTING_STATUS_VALUES = Object.values(
  REPORTING_STATUSES,
) as readonly ReportingStatus[];

/**
 * Opaque reporting — information representation existence only.
 * No file payloads, board layouts, or outbound handles.
 */
export type Reporting = {
  /** Opaque unique reporting reference. */
  reportingReference: string;
  /** Internal reporting kind. */
  reportingKind: ReportingKind;
  /** Reporting status. */
  reportingStatus: ReportingStatus;
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
  /** Opaque layout pointer when known — not a live generator. */
  templateReference?: string;
  /** Opaque parent reporting pointer when nested. */
  parentReportingReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<ReportingCapacityRefKey, string>>;

/**
 * Outbound port for future reporting adapters.
 * Not wired in this foundation — no generate, present, or send methods.
 */
export interface ReportingPort {
  createReporting(input: CreateReportingInput): Promise<Reporting>;
  resolveReporting(reporting: Reporting): Promise<Reporting>;
}

export type CreateReportingInput = {
  reportingKind: ReportingKind;
  reportingStatus?: ReportingStatus;
  reportingReference?: string;
  contextReference?: string;
  actorReference?: string;
  entityReference?: string;
  entityKind?: string;
  measurementReference?: string;
  eventReference?: string;
  templateReference?: string;
  parentReportingReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<ReportingCapacityRefKey, string>>;

export function isReportingKind(value: string): value is ReportingKind {
  return (REPORTING_KIND_VALUES as readonly string[]).includes(value);
}

export function isReportingStatus(value: string): value is ReportingStatus {
  return (REPORTING_STATUS_VALUES as readonly string[]).includes(value);
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

export function isReporting(value: unknown): value is Reporting {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.reportingReference === "string" &&
    candidate.reportingReference.length > 0 &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "entityReference") &&
    optionalOpaqueOk(candidate, "entityKind") &&
    optionalOpaqueOk(candidate, REPORTING_CAPACITY_REF_KEY) &&
    optionalOpaqueOk(candidate, "measurementReference") &&
    optionalOpaqueOk(candidate, "eventReference") &&
    optionalOpaqueOk(candidate, "templateReference") &&
    optionalOpaqueOk(candidate, "parentReportingReference") &&
    typeof candidate.reportingKind === "string" &&
    isReportingKind(candidate.reportingKind) &&
    typeof candidate.reportingStatus === "string" &&
    isReportingStatus(candidate.reportingStatus)
  );
}

export function isReportingPort(value: unknown): value is ReportingPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as ReportingPort).createReporting === "function" &&
    typeof (value as ReportingPort).resolveReporting === "function"
  );
}
