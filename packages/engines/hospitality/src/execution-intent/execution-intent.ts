/**
 * Hospitality Engagement Execution Intent — concrete future-perform intent only.
 * Bridge only: Execution Boundary → Execution Intent → future perform layer.
 *
 * Distinct from Action Intent (what we want), Execution Boundary (handoff frame),
 * and Action (something that occurs). Records a concrete future-perform intent —
 * it does not perform.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-EXECUTION-INTENT-001
 */

/** Internal execution-intent kinds — future-perform modes, not performed outcomes. */
export const ENGAGEMENT_EXECUTION_INTENT_KINDS = {
  /** Intent about a future activity perform step. */
  Activity: "execution-intent.activity",
  /** Intent about community. */
  Community: "execution-intent.community",
  /** Intent about business. */
  Business: "execution-intent.business",
  /** Intent about visitor experience. */
  Experience: "execution-intent.experience",
  /** Intent about members. */
  Member: "execution-intent.member",
  /** Intent about person–business relationship. */
  Engagement: "execution-intent.engagement",
  /** Internal MotanOS hospitality execution intent. */
  Internal: "execution-intent.internal",
} as const;

export type EngagementExecutionIntentKind =
  (typeof ENGAGEMENT_EXECUTION_INTENT_KINDS)[keyof typeof ENGAGEMENT_EXECUTION_INTENT_KINDS];

export const ENGAGEMENT_EXECUTION_INTENT_KIND_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_INTENT_KINDS,
) as readonly EngagementExecutionIntentKind[];

/** Execution-intent lifecycle status (existence labels only — no perform runtime). */
export const ENGAGEMENT_EXECUTION_INTENT_STATUSES = {
  Draft: "draft",
  Prepared: "prepared",
  Ready: "ready",
  Pending: "pending",
  Started: "started",
  Completed: "completed",
  Cancelled: "cancelled",
  Expired: "expired",
  Archived: "archived",
} as const;

export type EngagementExecutionIntentStatus =
  (typeof ENGAGEMENT_EXECUTION_INTENT_STATUSES)[keyof typeof ENGAGEMENT_EXECUTION_INTENT_STATUSES];

export const ENGAGEMENT_EXECUTION_INTENT_STATUS_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_INTENT_STATUSES,
) as readonly EngagementExecutionIntentStatus[];

/**
 * Opaque hospitality engagement execution intent — future-perform intent only.
 * Concrete intent a later perform layer may consume.
 * No outcome payloads, pipelines, remote hooks, models, or job payloads.
 */
export type HospitalityEngagementExecutionIntent = {
  /** Opaque unique execution-intent reference. */
  executionIntentReference: string;
  /** Internal execution-intent kind. */
  executionIntentKind: EngagementExecutionIntentKind;
  /** Execution-intent status. */
  executionIntentStatus: EngagementExecutionIntentStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque execution-boundary pointer when known. */
  boundaryReference?: string;
  /** Opaque action-intent pointer when known. */
  actionIntentReference?: string;
  /** Opaque approval pointer when known. */
  approvalReference?: string;
  /** Opaque proposal pointer when known. */
  proposalReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque executor pointer when known. */
  executorReference?: string;
  /** Opaque parent execution-intent pointer when nested. */
  parentExecutionIntentReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-execution-intent adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementExecutionIntentPort {
  createExecutionIntent(
    input: CreateEngagementExecutionIntentInput,
  ): Promise<HospitalityEngagementExecutionIntent>;
  resolveExecutionIntent(
    intent: HospitalityEngagementExecutionIntent,
  ): Promise<HospitalityEngagementExecutionIntent>;
}

export type CreateEngagementExecutionIntentInput = {
  executionIntentKind: EngagementExecutionIntentKind;
  executionIntentStatus?: EngagementExecutionIntentStatus;
  executionIntentReference?: string;
  hospitalityReference?: string;
  boundaryReference?: string;
  actionIntentReference?: string;
  approvalReference?: string;
  proposalReference?: string;
  contextReference?: string;
  executorReference?: string;
  parentExecutionIntentReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementExecutionIntentKind(
  value: string,
): value is EngagementExecutionIntentKind {
  return (
    ENGAGEMENT_EXECUTION_INTENT_KIND_VALUES as readonly string[]
  ).includes(value);
}

export function isEngagementExecutionIntentStatus(
  value: string,
): value is EngagementExecutionIntentStatus {
  return (
    ENGAGEMENT_EXECUTION_INTENT_STATUS_VALUES as readonly string[]
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

export function isHospitalityEngagementExecutionIntent(
  value: unknown,
): value is HospitalityEngagementExecutionIntent {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.executionIntentReference === "string" &&
    candidate.executionIntentReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "boundaryReference") &&
    optionalOpaqueOk(candidate, "actionIntentReference") &&
    optionalOpaqueOk(candidate, "approvalReference") &&
    optionalOpaqueOk(candidate, "proposalReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "executorReference") &&
    optionalOpaqueOk(candidate, "parentExecutionIntentReference") &&
    typeof candidate.executionIntentKind === "string" &&
    isEngagementExecutionIntentKind(candidate.executionIntentKind) &&
    typeof candidate.executionIntentStatus === "string" &&
    isEngagementExecutionIntentStatus(candidate.executionIntentStatus)
  );
}

export function isEngagementExecutionIntentPort(
  value: unknown,
): value is EngagementExecutionIntentPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementExecutionIntentPort).createExecutionIntent ===
      "function" &&
    typeof (value as EngagementExecutionIntentPort).resolveExecutionIntent ===
      "function"
  );
}
