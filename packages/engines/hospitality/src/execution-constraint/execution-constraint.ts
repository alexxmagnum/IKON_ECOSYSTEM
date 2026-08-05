/**
 * Hospitality Engagement Execution Constraint — future-limit descriptor only.
 * Bridge only: Execution Context → Execution Constraint → future perform layer.
 *
 * Distinct from Execution Intent (what to perform), Execution Context (frame),
 * and Action (something occurs). Records a contextual limit for a later perform
 * layer — it describes, it does not impose.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-EXECUTION-CONSTRAINT-001
 */

/** Internal execution-constraint kinds — limit modes, not imposed outcomes. */
export const ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS = {
  /** Limit about a future activity. */
  Activity: "execution-constraint.activity",
  /** Limit about community. */
  Community: "execution-constraint.community",
  /** Limit about business. */
  Business: "execution-constraint.business",
  /** Limit about visitor experience. */
  Experience: "execution-constraint.experience",
  /** Limit about members. */
  Member: "execution-constraint.member",
  /** Limit about person–business relationship. */
  Engagement: "execution-constraint.engagement",
  /** Internal MotanOS hospitality execution constraint. */
  Internal: "execution-constraint.internal",
} as const;

export type EngagementExecutionConstraintKind =
  (typeof ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS)[keyof typeof ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS];

export const ENGAGEMENT_EXECUTION_CONSTRAINT_KIND_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_CONSTRAINT_KINDS,
) as readonly EngagementExecutionConstraintKind[];

/** Execution-constraint lifecycle status (existence labels only — no impose runtime). */
export const ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES = {
  Draft: "draft",
  Defined: "defined",
  Available: "available",
  Active: "active",
  Inactive: "inactive",
  Expired: "expired",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type EngagementExecutionConstraintStatus =
  (typeof ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES)[keyof typeof ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES];

export const ENGAGEMENT_EXECUTION_CONSTRAINT_STATUS_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_CONSTRAINT_STATUSES,
) as readonly EngagementExecutionConstraintStatus[];

/**
 * Opaque hospitality engagement execution constraint — limit descriptor only.
 * A contextual bound a later perform layer may consult.
 * No outcome payloads, pipelines, remote hooks, models, or job payloads.
 */
export type HospitalityEngagementExecutionConstraint = {
  /** Opaque unique execution-constraint reference. */
  executionConstraintReference: string;
  /** Internal execution-constraint kind. */
  executionConstraintKind: EngagementExecutionConstraintKind;
  /** Execution-constraint status. */
  executionConstraintStatus: EngagementExecutionConstraintStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque execution-context pointer when known. */
  executionContextReference?: string;
  /** Opaque execution-intent pointer when known. */
  executionIntentReference?: string;
  /** Opaque execution-boundary pointer when known. */
  boundaryReference?: string;
  /** Opaque action-intent pointer when known. */
  actionIntentReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque experience pointer when known. */
  experienceReference?: string;
  /** Opaque parent constraint pointer when nested. */
  parentConstraintReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-execution-constraint adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementExecutionConstraintPort {
  createExecutionConstraint(
    input: CreateEngagementExecutionConstraintInput,
  ): Promise<HospitalityEngagementExecutionConstraint>;
  resolveExecutionConstraint(
    constraint: HospitalityEngagementExecutionConstraint,
  ): Promise<HospitalityEngagementExecutionConstraint>;
}

export type CreateEngagementExecutionConstraintInput = {
  executionConstraintKind: EngagementExecutionConstraintKind;
  executionConstraintStatus?: EngagementExecutionConstraintStatus;
  executionConstraintReference?: string;
  hospitalityReference?: string;
  executionContextReference?: string;
  executionIntentReference?: string;
  boundaryReference?: string;
  actionIntentReference?: string;
  memberReference?: string;
  communityReference?: string;
  experienceReference?: string;
  parentConstraintReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementExecutionConstraintKind(
  value: string,
): value is EngagementExecutionConstraintKind {
  return (
    ENGAGEMENT_EXECUTION_CONSTRAINT_KIND_VALUES as readonly string[]
  ).includes(value);
}

export function isEngagementExecutionConstraintStatus(
  value: string,
): value is EngagementExecutionConstraintStatus {
  return (
    ENGAGEMENT_EXECUTION_CONSTRAINT_STATUS_VALUES as readonly string[]
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

export function isHospitalityEngagementExecutionConstraint(
  value: unknown,
): value is HospitalityEngagementExecutionConstraint {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.executionConstraintReference === "string" &&
    candidate.executionConstraintReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "executionContextReference") &&
    optionalOpaqueOk(candidate, "executionIntentReference") &&
    optionalOpaqueOk(candidate, "boundaryReference") &&
    optionalOpaqueOk(candidate, "actionIntentReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "experienceReference") &&
    optionalOpaqueOk(candidate, "parentConstraintReference") &&
    typeof candidate.executionConstraintKind === "string" &&
    isEngagementExecutionConstraintKind(candidate.executionConstraintKind) &&
    typeof candidate.executionConstraintStatus === "string" &&
    isEngagementExecutionConstraintStatus(
      candidate.executionConstraintStatus,
    )
  );
}

export function isEngagementExecutionConstraintPort(
  value: unknown,
): value is EngagementExecutionConstraintPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementExecutionConstraintPort)
      .createExecutionConstraint === "function" &&
    typeof (value as EngagementExecutionConstraintPort)
      .resolveExecutionConstraint === "function"
  );
}
