/**
 * Hospitality Engagement Execution Capability — availability descriptor only.
 * Bridge only: Execution Constraint → Execution Capability → future perform layer.
 *
 * Distinct from Execution Intent (what to perform), Execution Constraint (limits),
 * and Action (something occurs). Records that a capacity exists for a later
 * perform layer — it describes availability, it does not perform.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-EXECUTION-CAPABILITY-001
 */

/** Internal execution-capability kinds — availability modes, not performed outcomes. */
export const ENGAGEMENT_EXECUTION_CAPABILITY_KINDS = {
  /** Capability about a future activity. */
  Activity: "execution-capability.activity",
  /** Capability about community. */
  Community: "execution-capability.community",
  /** Capability about business. */
  Business: "execution-capability.business",
  /** Capability about visitor experience. */
  Experience: "execution-capability.experience",
  /** Capability about members. */
  Member: "execution-capability.member",
  /** Capability about person–business relationship. */
  Engagement: "execution-capability.engagement",
  /** Internal MotanOS hospitality execution capability. */
  Internal: "execution-capability.internal",
} as const;

export type EngagementExecutionCapabilityKind =
  (typeof ENGAGEMENT_EXECUTION_CAPABILITY_KINDS)[keyof typeof ENGAGEMENT_EXECUTION_CAPABILITY_KINDS];

export const ENGAGEMENT_EXECUTION_CAPABILITY_KIND_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_CAPABILITY_KINDS,
) as readonly EngagementExecutionCapabilityKind[];

/** Execution-capability lifecycle status (existence labels only — no perform runtime). */
export const ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES = {
  Draft: "draft",
  Registered: "registered",
  Available: "available",
  Active: "active",
  Inactive: "inactive",
  Expired: "expired",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type EngagementExecutionCapabilityStatus =
  (typeof ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES)[keyof typeof ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES];

export const ENGAGEMENT_EXECUTION_CAPABILITY_STATUS_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_CAPABILITY_STATUSES,
) as readonly EngagementExecutionCapabilityStatus[];

/**
 * Opaque hospitality engagement execution capability — availability only.
 * A capacity a later perform layer may consult.
 * No outcome payloads, pipelines, remote hooks, models, or connector payloads.
 */
export type HospitalityEngagementExecutionCapability = {
  /** Opaque unique execution-capability reference. */
  executionCapabilityReference: string;
  /** Internal execution-capability kind. */
  executionCapabilityKind: EngagementExecutionCapabilityKind;
  /** Execution-capability status. */
  executionCapabilityStatus: EngagementExecutionCapabilityStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque execution-context pointer when known. */
  executionContextReference?: string;
  /** Opaque execution-intent pointer when known. */
  executionIntentReference?: string;
  /** Opaque constraint pointer when known. */
  constraintReference?: string;
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
  /** Opaque provider pointer when known. */
  providerReference?: string;
  /** Opaque parent capability pointer when nested. */
  parentCapabilityReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-execution-capability adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementExecutionCapabilityPort {
  createExecutionCapability(
    input: CreateEngagementExecutionCapabilityInput,
  ): Promise<HospitalityEngagementExecutionCapability>;
  resolveExecutionCapability(
    capability: HospitalityEngagementExecutionCapability,
  ): Promise<HospitalityEngagementExecutionCapability>;
}

export type CreateEngagementExecutionCapabilityInput = {
  executionCapabilityKind: EngagementExecutionCapabilityKind;
  executionCapabilityStatus?: EngagementExecutionCapabilityStatus;
  executionCapabilityReference?: string;
  hospitalityReference?: string;
  executionContextReference?: string;
  executionIntentReference?: string;
  constraintReference?: string;
  boundaryReference?: string;
  actionIntentReference?: string;
  memberReference?: string;
  communityReference?: string;
  experienceReference?: string;
  providerReference?: string;
  parentCapabilityReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementExecutionCapabilityKind(
  value: string,
): value is EngagementExecutionCapabilityKind {
  return (
    ENGAGEMENT_EXECUTION_CAPABILITY_KIND_VALUES as readonly string[]
  ).includes(value);
}

export function isEngagementExecutionCapabilityStatus(
  value: string,
): value is EngagementExecutionCapabilityStatus {
  return (
    ENGAGEMENT_EXECUTION_CAPABILITY_STATUS_VALUES as readonly string[]
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

export function isHospitalityEngagementExecutionCapability(
  value: unknown,
): value is HospitalityEngagementExecutionCapability {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.executionCapabilityReference === "string" &&
    candidate.executionCapabilityReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "executionContextReference") &&
    optionalOpaqueOk(candidate, "executionIntentReference") &&
    optionalOpaqueOk(candidate, "constraintReference") &&
    optionalOpaqueOk(candidate, "boundaryReference") &&
    optionalOpaqueOk(candidate, "actionIntentReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "experienceReference") &&
    optionalOpaqueOk(candidate, "providerReference") &&
    optionalOpaqueOk(candidate, "parentCapabilityReference") &&
    typeof candidate.executionCapabilityKind === "string" &&
    isEngagementExecutionCapabilityKind(candidate.executionCapabilityKind) &&
    typeof candidate.executionCapabilityStatus === "string" &&
    isEngagementExecutionCapabilityStatus(
      candidate.executionCapabilityStatus,
    )
  );
}

export function isEngagementExecutionCapabilityPort(
  value: unknown,
): value is EngagementExecutionCapabilityPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementExecutionCapabilityPort)
      .createExecutionCapability === "function" &&
    typeof (value as EngagementExecutionCapabilityPort)
      .resolveExecutionCapability === "function"
  );
}
