/**
 * Hospitality Engagement Action Intent — persisted future-intent only.
 * Bridge only: Approval Context → Action Intent → future Execution Boundary.
 *
 * Distinct from Approval (review), Action (something that occurs), and Activity (published).
 * An intent records that something may happen later — it does not perform it.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-ACTION-INTENT-CONTEXT-001
 */

/** Internal action-intent kinds — future-intent modes, not performed outcomes. */
export const ENGAGEMENT_ACTION_INTENT_KINDS = {
  /** Intent about a future activity. */
  Activity: "intent.activity",
  /** Intent about community. */
  Community: "intent.community",
  /** Intent about business. */
  Business: "intent.business",
  /** Intent about visitor experience. */
  Experience: "intent.experience",
  /** Intent about members. */
  Member: "intent.member",
  /** Intent about person–business relationship. */
  Engagement: "intent.engagement",
  /** Internal MotanOS hospitality action intent. */
  Internal: "intent.internal",
} as const;

export type EngagementActionIntentKind =
  (typeof ENGAGEMENT_ACTION_INTENT_KINDS)[keyof typeof ENGAGEMENT_ACTION_INTENT_KINDS];

export const ENGAGEMENT_ACTION_INTENT_KIND_VALUES = Object.values(
  ENGAGEMENT_ACTION_INTENT_KINDS,
) as readonly EngagementActionIntentKind[];

/** Action-intent lifecycle status (existence labels only — no perform runtime). */
export const ENGAGEMENT_ACTION_INTENT_STATUSES = {
  Draft: "draft",
  Created: "created",
  Approved: "approved",
  Prepared: "prepared",
  Scheduled: "scheduled",
  Completed: "completed",
  Cancelled: "cancelled",
  Expired: "expired",
  Archived: "archived",
} as const;

export type EngagementActionIntentStatus =
  (typeof ENGAGEMENT_ACTION_INTENT_STATUSES)[keyof typeof ENGAGEMENT_ACTION_INTENT_STATUSES];

export const ENGAGEMENT_ACTION_INTENT_STATUS_VALUES = Object.values(
  ENGAGEMENT_ACTION_INTENT_STATUSES,
) as readonly EngagementActionIntentStatus[];

/**
 * Opaque hospitality engagement action intent — future-intent existence only.
 * Derived from an approval; may later feed a perform layer.
 * No perform payloads, pipelines, remote hooks, models, or outcome payloads.
 */
export type HospitalityEngagementActionIntent = {
  /** Opaque unique intent reference. */
  intentReference: string;
  /** Internal action-intent kind. */
  intentKind: EngagementActionIntentKind;
  /** Action-intent status. */
  intentStatus: EngagementActionIntentStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque approval pointer when known. */
  approvalReference?: string;
  /** Opaque proposal pointer when known. */
  proposalReference?: string;
  /** Opaque decision-context pointer when known. */
  decisionContextReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque experience pointer when known. */
  experienceReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque creator pointer when known. */
  creatorReference?: string;
  /** Opaque parent intent pointer when nested. */
  parentIntentReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-action-intent adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementActionIntentPort {
  createActionIntent(
    input: CreateEngagementActionIntentInput,
  ): Promise<HospitalityEngagementActionIntent>;
  resolveActionIntent(
    intent: HospitalityEngagementActionIntent,
  ): Promise<HospitalityEngagementActionIntent>;
}

export type CreateEngagementActionIntentInput = {
  intentKind: EngagementActionIntentKind;
  intentStatus?: EngagementActionIntentStatus;
  intentReference?: string;
  hospitalityReference?: string;
  approvalReference?: string;
  proposalReference?: string;
  decisionContextReference?: string;
  activityReference?: string;
  experienceReference?: string;
  communityReference?: string;
  memberReference?: string;
  contextReference?: string;
  creatorReference?: string;
  parentIntentReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementActionIntentKind(
  value: string,
): value is EngagementActionIntentKind {
  return (ENGAGEMENT_ACTION_INTENT_KIND_VALUES as readonly string[]).includes(
    value,
  );
}

export function isEngagementActionIntentStatus(
  value: string,
): value is EngagementActionIntentStatus {
  return (
    ENGAGEMENT_ACTION_INTENT_STATUS_VALUES as readonly string[]
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

export function isHospitalityEngagementActionIntent(
  value: unknown,
): value is HospitalityEngagementActionIntent {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.intentReference === "string" &&
    candidate.intentReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "approvalReference") &&
    optionalOpaqueOk(candidate, "proposalReference") &&
    optionalOpaqueOk(candidate, "decisionContextReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "experienceReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "creatorReference") &&
    optionalOpaqueOk(candidate, "parentIntentReference") &&
    typeof candidate.intentKind === "string" &&
    isEngagementActionIntentKind(candidate.intentKind) &&
    typeof candidate.intentStatus === "string" &&
    isEngagementActionIntentStatus(candidate.intentStatus)
  );
}

export function isEngagementActionIntentPort(
  value: unknown,
): value is EngagementActionIntentPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementActionIntentPort).createActionIntent ===
      "function" &&
    typeof (value as EngagementActionIntentPort).resolveActionIntent ===
      "function"
  );
}
