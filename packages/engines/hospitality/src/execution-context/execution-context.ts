/**
 * Hospitality Engagement Execution Context — future-perform frame only.
 * Bridge only: Execution Intent → Execution Context → future perform layer.
 *
 * Distinct from Execution Intent (what to perform) and Action (something occurs).
 * Records contextual conditions for a later perform layer — it does not perform.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-EXECUTION-CONTEXT-001
 */

/** Internal execution-context kinds — contextual frames, not performed outcomes. */
export const ENGAGEMENT_EXECUTION_CONTEXT_KINDS = {
  /** Context about a future activity. */
  Activity: "execution-context.activity",
  /** Context about community. */
  Community: "execution-context.community",
  /** Context about business. */
  Business: "execution-context.business",
  /** Context about visitor experience. */
  Experience: "execution-context.experience",
  /** Context about members. */
  Member: "execution-context.member",
  /** Context about person–business relationship. */
  Engagement: "execution-context.engagement",
  /** Internal MotanOS hospitality execution context. */
  Internal: "execution-context.internal",
} as const;

export type EngagementExecutionContextKind =
  (typeof ENGAGEMENT_EXECUTION_CONTEXT_KINDS)[keyof typeof ENGAGEMENT_EXECUTION_CONTEXT_KINDS];

export const ENGAGEMENT_EXECUTION_CONTEXT_KIND_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_CONTEXT_KINDS,
) as readonly EngagementExecutionContextKind[];

/** Execution-context lifecycle status (existence labels only — no perform runtime). */
export const ENGAGEMENT_EXECUTION_CONTEXT_STATUSES = {
  Draft: "draft",
  Prepared: "prepared",
  Available: "available",
  Active: "active",
  Completed: "completed",
  Expired: "expired",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type EngagementExecutionContextStatus =
  (typeof ENGAGEMENT_EXECUTION_CONTEXT_STATUSES)[keyof typeof ENGAGEMENT_EXECUTION_CONTEXT_STATUSES];

export const ENGAGEMENT_EXECUTION_CONTEXT_STATUS_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_CONTEXT_STATUSES,
) as readonly EngagementExecutionContextStatus[];

/**
 * Opaque hospitality engagement execution context — contextual frame only.
 * Conditions a later perform layer may consult.
 * No outcome payloads, pipelines, remote hooks, models, or job payloads.
 */
export type HospitalityEngagementExecutionContext = {
  /** Opaque unique execution-context reference. */
  executionContextReference: string;
  /** Internal execution-context kind. */
  executionContextKind: EngagementExecutionContextKind;
  /** Execution-context status. */
  executionContextStatus: EngagementExecutionContextStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque execution-intent pointer when known. */
  executionIntentReference?: string;
  /** Opaque execution-boundary pointer when known. */
  boundaryReference?: string;
  /** Opaque action-intent pointer when known. */
  actionIntentReference?: string;
  /** Opaque approval pointer when known. */
  approvalReference?: string;
  /** Opaque proposal pointer when known. */
  proposalReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque experience pointer when known. */
  experienceReference?: string;
  /** Opaque parent execution-context pointer when nested. */
  parentExecutionContextReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-execution-context adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementExecutionContextPort {
  createExecutionContext(
    input: CreateEngagementExecutionContextInput,
  ): Promise<HospitalityEngagementExecutionContext>;
  resolveExecutionContext(
    context: HospitalityEngagementExecutionContext,
  ): Promise<HospitalityEngagementExecutionContext>;
}

export type CreateEngagementExecutionContextInput = {
  executionContextKind: EngagementExecutionContextKind;
  executionContextStatus?: EngagementExecutionContextStatus;
  executionContextReference?: string;
  hospitalityReference?: string;
  executionIntentReference?: string;
  boundaryReference?: string;
  actionIntentReference?: string;
  approvalReference?: string;
  proposalReference?: string;
  locationReference?: string;
  memberReference?: string;
  communityReference?: string;
  experienceReference?: string;
  parentExecutionContextReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementExecutionContextKind(
  value: string,
): value is EngagementExecutionContextKind {
  return (
    ENGAGEMENT_EXECUTION_CONTEXT_KIND_VALUES as readonly string[]
  ).includes(value);
}

export function isEngagementExecutionContextStatus(
  value: string,
): value is EngagementExecutionContextStatus {
  return (
    ENGAGEMENT_EXECUTION_CONTEXT_STATUS_VALUES as readonly string[]
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

export function isHospitalityEngagementExecutionContext(
  value: unknown,
): value is HospitalityEngagementExecutionContext {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.executionContextReference === "string" &&
    candidate.executionContextReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "executionIntentReference") &&
    optionalOpaqueOk(candidate, "boundaryReference") &&
    optionalOpaqueOk(candidate, "actionIntentReference") &&
    optionalOpaqueOk(candidate, "approvalReference") &&
    optionalOpaqueOk(candidate, "proposalReference") &&
    optionalOpaqueOk(candidate, "locationReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "experienceReference") &&
    optionalOpaqueOk(candidate, "parentExecutionContextReference") &&
    typeof candidate.executionContextKind === "string" &&
    isEngagementExecutionContextKind(candidate.executionContextKind) &&
    typeof candidate.executionContextStatus === "string" &&
    isEngagementExecutionContextStatus(candidate.executionContextStatus)
  );
}

export function isEngagementExecutionContextPort(
  value: unknown,
): value is EngagementExecutionContextPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementExecutionContextPort)
      .createExecutionContext === "function" &&
    typeof (value as EngagementExecutionContextPort)
      .resolveExecutionContext === "function"
  );
}
