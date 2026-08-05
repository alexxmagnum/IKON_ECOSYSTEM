/**
 * Hospitality Engagement Execution Resource — association descriptor only.
 * Bridge only: Execution Capability → Execution Resource → future perform layer.
 *
 * Distinct from Execution Capability (what capacity exists) and Action (something occurs).
 * Records that a resource is linked to a later perform step — it associates,
 * it does not spend or hold stock.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-EXECUTION-RESOURCE-001
 */

/** Internal execution-resource kinds — association modes, not spent outcomes. */
export const ENGAGEMENT_EXECUTION_RESOURCE_KINDS = {
  /** Resource about a future activity. */
  Activity: "execution-resource.activity",
  /** Resource about community. */
  Community: "execution-resource.community",
  /** Resource about business. */
  Business: "execution-resource.business",
  /** Resource about visitor experience. */
  Experience: "execution-resource.experience",
  /** Resource about members. */
  Member: "execution-resource.member",
  /** Resource about person–business relationship. */
  Engagement: "execution-resource.engagement",
  /** Internal MotanOS hospitality execution resource. */
  Internal: "execution-resource.internal",
} as const;

export type EngagementExecutionResourceKind =
  (typeof ENGAGEMENT_EXECUTION_RESOURCE_KINDS)[keyof typeof ENGAGEMENT_EXECUTION_RESOURCE_KINDS];

export const ENGAGEMENT_EXECUTION_RESOURCE_KIND_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_RESOURCE_KINDS,
) as readonly EngagementExecutionResourceKind[];

/** Execution-resource lifecycle status (existence labels only — no spend runtime). */
export const ENGAGEMENT_EXECUTION_RESOURCE_STATUSES = {
  Draft: "draft",
  Registered: "registered",
  Available: "available",
  Active: "active",
  Inactive: "inactive",
  Expired: "expired",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type EngagementExecutionResourceStatus =
  (typeof ENGAGEMENT_EXECUTION_RESOURCE_STATUSES)[keyof typeof ENGAGEMENT_EXECUTION_RESOURCE_STATUSES];

export const ENGAGEMENT_EXECUTION_RESOURCE_STATUS_VALUES = Object.values(
  ENGAGEMENT_EXECUTION_RESOURCE_STATUSES,
) as readonly EngagementExecutionResourceStatus[];

/**
 * Opaque hospitality engagement execution resource — association only.
 * A linked resource a later perform layer may consult.
 * No spend payloads, hold payloads, stock mutations, pipelines, or remote hooks.
 */
export type HospitalityEngagementExecutionResource = {
  /** Opaque unique execution-resource reference. */
  executionResourceReference: string;
  /** Internal execution-resource kind. */
  executionResourceKind: EngagementExecutionResourceKind;
  /** Execution-resource status. */
  executionResourceStatus: EngagementExecutionResourceStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque execution-capability pointer when known. */
  executionCapabilityReference?: string;
  /** Opaque execution-context pointer when known. */
  executionContextReference?: string;
  /** Opaque execution-intent pointer when known. */
  executionIntentReference?: string;
  /** Opaque constraint pointer when known. */
  constraintReference?: string;
  /** Opaque execution-boundary pointer when known. */
  boundaryReference?: string;
  /** Opaque provider pointer when known. */
  providerReference?: string;
  /** Opaque location pointer when known. */
  locationReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque experience pointer when known. */
  experienceReference?: string;
  /** Opaque parent resource pointer when nested. */
  parentResourceReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-execution-resource adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementExecutionResourcePort {
  createExecutionResource(
    input: CreateEngagementExecutionResourceInput,
  ): Promise<HospitalityEngagementExecutionResource>;
  resolveExecutionResource(
    resource: HospitalityEngagementExecutionResource,
  ): Promise<HospitalityEngagementExecutionResource>;
}

export type CreateEngagementExecutionResourceInput = {
  executionResourceKind: EngagementExecutionResourceKind;
  executionResourceStatus?: EngagementExecutionResourceStatus;
  executionResourceReference?: string;
  hospitalityReference?: string;
  executionCapabilityReference?: string;
  executionContextReference?: string;
  executionIntentReference?: string;
  constraintReference?: string;
  boundaryReference?: string;
  providerReference?: string;
  locationReference?: string;
  memberReference?: string;
  communityReference?: string;
  experienceReference?: string;
  parentResourceReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementExecutionResourceKind(
  value: string,
): value is EngagementExecutionResourceKind {
  return (
    ENGAGEMENT_EXECUTION_RESOURCE_KIND_VALUES as readonly string[]
  ).includes(value);
}

export function isEngagementExecutionResourceStatus(
  value: string,
): value is EngagementExecutionResourceStatus {
  return (
    ENGAGEMENT_EXECUTION_RESOURCE_STATUS_VALUES as readonly string[]
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

export function isHospitalityEngagementExecutionResource(
  value: unknown,
): value is HospitalityEngagementExecutionResource {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.executionResourceReference === "string" &&
    candidate.executionResourceReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "executionCapabilityReference") &&
    optionalOpaqueOk(candidate, "executionContextReference") &&
    optionalOpaqueOk(candidate, "executionIntentReference") &&
    optionalOpaqueOk(candidate, "constraintReference") &&
    optionalOpaqueOk(candidate, "boundaryReference") &&
    optionalOpaqueOk(candidate, "providerReference") &&
    optionalOpaqueOk(candidate, "locationReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "experienceReference") &&
    optionalOpaqueOk(candidate, "parentResourceReference") &&
    typeof candidate.executionResourceKind === "string" &&
    isEngagementExecutionResourceKind(candidate.executionResourceKind) &&
    typeof candidate.executionResourceStatus === "string" &&
    isEngagementExecutionResourceStatus(candidate.executionResourceStatus)
  );
}

export function isEngagementExecutionResourcePort(
  value: unknown,
): value is EngagementExecutionResourcePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementExecutionResourcePort)
      .createExecutionResource === "function" &&
    typeof (value as EngagementExecutionResourcePort)
      .resolveExecutionResource === "function"
  );
}
