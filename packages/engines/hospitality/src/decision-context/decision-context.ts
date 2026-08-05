/**
 * Hospitality Engagement Decision Context — assembled evaluation frame only.
 * Bridge only: Signal / Rule → Decision Context → future Copilot / Decision layer.
 *
 * Distinct from Signal (fact), Rule (criterion), Suggestion (proposal), and Decision (outcome).
 * A decision context prepares a situation for later review — it does not choose or run anything.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-DECISION-CONTEXT-001
 */

/** Internal decision-context kinds — assembled frames, not outcomes. */
export const ENGAGEMENT_DECISION_CONTEXT_KINDS = {
  /** Frame about person–business relationship. */
  Engagement: "decision-context.engagement",
  /** Frame about activities. */
  Activity: "decision-context.activity",
  /** Frame about community. */
  Community: "decision-context.community",
  /** Frame about members. */
  Member: "decision-context.member",
  /** Frame about business opportunities. */
  Business: "decision-context.business",
  /** Frame about visitor experience. */
  Experience: "decision-context.experience",
  /** Internal MotanOS hospitality decision context. */
  Internal: "decision-context.internal",
} as const;

export type EngagementDecisionContextKind =
  (typeof ENGAGEMENT_DECISION_CONTEXT_KINDS)[keyof typeof ENGAGEMENT_DECISION_CONTEXT_KINDS];

export const ENGAGEMENT_DECISION_CONTEXT_KIND_VALUES = Object.values(
  ENGAGEMENT_DECISION_CONTEXT_KINDS,
) as readonly EngagementDecisionContextKind[];

/** Decision-context lifecycle status (existence labels only — no evaluation runtime). */
export const ENGAGEMENT_DECISION_CONTEXT_STATUSES = {
  Draft: "draft",
  Assembled: "assembled",
  Available: "available",
  Evaluated: "evaluated",
  Inactive: "inactive",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type EngagementDecisionContextStatus =
  (typeof ENGAGEMENT_DECISION_CONTEXT_STATUSES)[keyof typeof ENGAGEMENT_DECISION_CONTEXT_STATUSES];

export const ENGAGEMENT_DECISION_CONTEXT_STATUS_VALUES = Object.values(
  ENGAGEMENT_DECISION_CONTEXT_STATUSES,
) as readonly EngagementDecisionContextStatus[];

/**
 * Opaque hospitality engagement decision context — assembled frame existence only.
 * Combines opaque pointers so a future layer may review a situation.
 * No outcomes, confidence metrics, prompts, models, or side-effect payloads.
 */
export type HospitalityEngagementDecisionContext = {
  /** Opaque unique decision-context reference. */
  decisionContextReference: string;
  /** Internal decision-context kind. */
  decisionContextKind: EngagementDecisionContextKind;
  /** Decision-context status. */
  decisionContextStatus: EngagementDecisionContextStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque engagement pointer when known. */
  engagementReference?: string;
  /** Opaque signal pointer when known. */
  signalReference?: string;
  /** Opaque rule pointer when known. */
  ruleReference?: string;
  /** Opaque suggestion pointer when known. */
  suggestionReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent decision-context pointer when nested. */
  parentDecisionContextReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-decision-context adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementDecisionContextPort {
  createDecisionContext(
    input: CreateEngagementDecisionContextInput,
  ): Promise<HospitalityEngagementDecisionContext>;
  resolveDecisionContext(
    decisionContext: HospitalityEngagementDecisionContext,
  ): Promise<HospitalityEngagementDecisionContext>;
}

export type CreateEngagementDecisionContextInput = {
  decisionContextKind: EngagementDecisionContextKind;
  decisionContextStatus?: EngagementDecisionContextStatus;
  decisionContextReference?: string;
  hospitalityReference?: string;
  engagementReference?: string;
  signalReference?: string;
  ruleReference?: string;
  suggestionReference?: string;
  activityReference?: string;
  memberReference?: string;
  communityReference?: string;
  contextReference?: string;
  parentDecisionContextReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementDecisionContextKind(
  value: string,
): value is EngagementDecisionContextKind {
  return (
    ENGAGEMENT_DECISION_CONTEXT_KIND_VALUES as readonly string[]
  ).includes(value);
}

export function isEngagementDecisionContextStatus(
  value: string,
): value is EngagementDecisionContextStatus {
  return (
    ENGAGEMENT_DECISION_CONTEXT_STATUS_VALUES as readonly string[]
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

export function isHospitalityEngagementDecisionContext(
  value: unknown,
): value is HospitalityEngagementDecisionContext {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.decisionContextReference === "string" &&
    candidate.decisionContextReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "engagementReference") &&
    optionalOpaqueOk(candidate, "signalReference") &&
    optionalOpaqueOk(candidate, "ruleReference") &&
    optionalOpaqueOk(candidate, "suggestionReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "parentDecisionContextReference") &&
    typeof candidate.decisionContextKind === "string" &&
    isEngagementDecisionContextKind(candidate.decisionContextKind) &&
    typeof candidate.decisionContextStatus === "string" &&
    isEngagementDecisionContextStatus(candidate.decisionContextStatus)
  );
}

export function isEngagementDecisionContextPort(
  value: unknown,
): value is EngagementDecisionContextPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementDecisionContextPort).createDecisionContext ===
      "function" &&
    typeof (value as EngagementDecisionContextPort).resolveDecisionContext ===
      "function"
  );
}
