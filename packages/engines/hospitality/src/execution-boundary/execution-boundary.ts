/**
 * Hospitality Engagement Execution Boundary — handoff frame only.
 * Bridge only: Action Intent → Execution Boundary → future perform layer.
 *
 * Distinct from Action Intent (want to do something) and Action (something occurs).
 * A boundary records readiness for a later perform layer — it does not perform.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-EXECUTION-BOUNDARY-001
 */

/** Internal execution-boundary kinds — handoff modes, not performed outcomes. */
export const ENGAGEMENT_EXECUTION_BOUNDARY_KINDS = {
  /** Boundary tied to an action intent. */
  Intent: "execution.intent",
  /** Boundary tied to a future activity. */
  Activity: "execution.activity",
  /** Boundary tied to community. */
  Community: "execution.community",
  /** Boundary tied to business. */
  Business: "execution.business",
  /** Boundary tied to visitor experience. */
  Experience: "execution.experience",
  /** Internal MotanOS hospitality execution boundary. */
  Internal: "execution.internal",
} as const;

export type EngagementExecutionBoundaryKind =
  (typeof ENGAGEMENT_EXECUTION_BOUNDARY_KINDS)[keyof typeof ENGAGEMENT_EXECUTION_BOUNDARY_KINDS];

export const ENGAGEMENT_EXECUTION_BOUNDARY_KIND_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_BOUNDARY_KINDS,
) as readonly EngagementExecutionBoundaryKind[];

/** Execution-boundary lifecycle status (existence labels only — no perform runtime). */
export const ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES = {
  Draft: "draft",
  Ready: "ready",
  Pending: "pending",
  Delegated: "delegated",
  Completed: "completed",
  Cancelled: "cancelled",
  Expired: "expired",
  Archived: "archived",
} as const;

export type EngagementExecutionBoundaryStatus =
  (typeof ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES)[keyof typeof ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES];

export const ENGAGEMENT_EXECUTION_BOUNDARY_STATUS_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_BOUNDARY_STATUSES,
) as readonly EngagementExecutionBoundaryStatus[];

/**
 * Opaque hospitality engagement execution boundary — handoff existence only.
 * Separates an approved intent from a future perform layer.
 * No outcome payloads, pipelines, remote hooks, models, or job payloads.
 */
export type HospitalityEngagementExecutionBoundary = {
  /** Opaque unique boundary reference. */
  boundaryReference: string;
  /** Internal execution-boundary kind. */
  boundaryKind: EngagementExecutionBoundaryKind;
  /** Execution-boundary status. */
  boundaryStatus: EngagementExecutionBoundaryStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque action-intent pointer when known. */
  intentReference?: string;
  /** Opaque approval pointer when known. */
  approvalReference?: string;
  /** Opaque proposal pointer when known. */
  proposalReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque executor pointer when known. */
  executorReference?: string;
  /** Opaque parent boundary pointer when nested. */
  parentBoundaryReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-execution-boundary adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementExecutionBoundaryPort {
  createExecutionBoundary(
    input: CreateEngagementExecutionBoundaryInput,
  ): Promise<HospitalityEngagementExecutionBoundary>;
  resolveExecutionBoundary(
    boundary: HospitalityEngagementExecutionBoundary,
  ): Promise<HospitalityEngagementExecutionBoundary>;
}

export type CreateEngagementExecutionBoundaryInput = {
  boundaryKind: EngagementExecutionBoundaryKind;
  boundaryStatus?: EngagementExecutionBoundaryStatus;
  boundaryReference?: string;
  hospitalityReference?: string;
  intentReference?: string;
  approvalReference?: string;
  proposalReference?: string;
  contextReference?: string;
  executorReference?: string;
  parentBoundaryReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementExecutionBoundaryKind(
  value: string,
): value is EngagementExecutionBoundaryKind {
  return (
    ENGAGEMENT_EXECUTION_BOUNDARY_KIND_VALUES as readonly string[]
  ).includes(value);
}

export function isEngagementExecutionBoundaryStatus(
  value: string,
): value is EngagementExecutionBoundaryStatus {
  return (
    ENGAGEMENT_EXECUTION_BOUNDARY_STATUS_VALUES as readonly string[]
  ).includes(value);
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

export function isHospitalityEngagementExecutionBoundary(
  value: unknown,
): value is HospitalityEngagementExecutionBoundary {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.boundaryReference === "string" &&
    candidate.boundaryReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "intentReference") &&
    optionalOpaqueOk(candidate, "approvalReference") &&
    optionalOpaqueOk(candidate, "proposalReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "executorReference") &&
    optionalOpaqueOk(candidate, "parentBoundaryReference") &&
    typeof candidate.boundaryKind === "string" &&
    isEngagementExecutionBoundaryKind(candidate.boundaryKind) &&
    typeof candidate.boundaryStatus === "string" &&
    isEngagementExecutionBoundaryStatus(candidate.boundaryStatus)
  );
}

export function isEngagementExecutionBoundaryPort(
  value: unknown,
): value is EngagementExecutionBoundaryPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementExecutionBoundaryPort)
      .createExecutionBoundary === "function" &&
    typeof (value as EngagementExecutionBoundaryPort)
      .resolveExecutionBoundary === "function"
  );
}
