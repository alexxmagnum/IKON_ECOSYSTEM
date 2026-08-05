/**
 * Hospitality Engagement Suggestion — proposal prior to a published action.
 * Bridge only: Engagement → Suggestion → future Activity / Schedule / Participation.
 *
 * Distinct from Activity (published) and from Automation / generative systems.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-SUGGESTION-CONTEXT-001
 */

/** Internal suggestion kinds — proposal modes, not executed activities. */
export const ENGAGEMENT_SUGGESTION_KINDS = {
  /** Proposal for an activity. */
  Activity: "suggestion.activity",
  /** Proposal for an event. */
  Event: "suggestion.event",
  /** Proposal to improve an experience. */
  Experience: "suggestion.experience",
  /** Social / community proposal. */
  Community: "suggestion.community",
  /** Business-related proposal. */
  Business: "suggestion.business",
  /** Internal MotanOS hospitality suggestion. */
  Internal: "suggestion.internal",
} as const;

export type EngagementSuggestionKind =
  (typeof ENGAGEMENT_SUGGESTION_KINDS)[keyof typeof ENGAGEMENT_SUGGESTION_KINDS];

export const ENGAGEMENT_SUGGESTION_KIND_VALUES = Object.values(
  ENGAGEMENT_SUGGESTION_KINDS,
) as readonly EngagementSuggestionKind[];

/** Suggestion lifecycle status (existence labels only — no approval/conversion ops). */
export const ENGAGEMENT_SUGGESTION_STATUSES = {
  Draft: "draft",
  Submitted: "submitted",
  Review: "review",
  Accepted: "accepted",
  Rejected: "rejected",
  Converted: "converted",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type EngagementSuggestionStatus =
  (typeof ENGAGEMENT_SUGGESTION_STATUSES)[keyof typeof ENGAGEMENT_SUGGESTION_STATUSES];

export const ENGAGEMENT_SUGGESTION_STATUS_VALUES = Object.values(
  ENGAGEMENT_SUGGESTION_STATUSES,
) as readonly EngagementSuggestionStatus[];

/**
 * Opaque hospitality engagement suggestion — proposal existence only.
 * May later convert to Activity; conversion runtime is deferred.
 * No approval workflows, schedule payloads, notify hooks, or generative payloads.
 */
export type HospitalityEngagementSuggestion = {
  /** Opaque unique suggestion reference. */
  suggestionReference: string;
  /** Internal suggestion kind. */
  suggestionKind: EngagementSuggestionKind;
  /** Suggestion status. */
  suggestionStatus: EngagementSuggestionStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque actor pointer when known. */
  actorReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque engagement pointer when known. */
  engagementReference?: string;
  /** Opaque related activity pointer when known (not a conversion result). */
  activityReference?: string;
  /** Opaque parent suggestion pointer when nested. */
  parentSuggestionReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-suggestion adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementSuggestionPort {
  createSuggestion(
    input: CreateEngagementSuggestionInput,
  ): Promise<HospitalityEngagementSuggestion>;
  resolveSuggestion(
    suggestion: HospitalityEngagementSuggestion,
  ): Promise<HospitalityEngagementSuggestion>;
}

export type CreateEngagementSuggestionInput = {
  suggestionKind: EngagementSuggestionKind;
  suggestionStatus?: EngagementSuggestionStatus;
  suggestionReference?: string;
  hospitalityReference?: string;
  communityReference?: string;
  actorReference?: string;
  memberReference?: string;
  engagementReference?: string;
  activityReference?: string;
  parentSuggestionReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementSuggestionKind(
  value: string,
): value is EngagementSuggestionKind {
  return (ENGAGEMENT_SUGGESTION_KIND_VALUES as readonly string[]).includes(
    value,
  );
}

export function isEngagementSuggestionStatus(
  value: string,
): value is EngagementSuggestionStatus {
  return (ENGAGEMENT_SUGGESTION_STATUS_VALUES as readonly string[]).includes(
    value,
  );
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

export function isHospitalityEngagementSuggestion(
  value: unknown,
): value is HospitalityEngagementSuggestion {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.suggestionReference === "string" &&
    candidate.suggestionReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "actorReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "engagementReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "parentSuggestionReference") &&
    typeof candidate.suggestionKind === "string" &&
    isEngagementSuggestionKind(candidate.suggestionKind) &&
    typeof candidate.suggestionStatus === "string" &&
    isEngagementSuggestionStatus(candidate.suggestionStatus)
  );
}

export function isEngagementSuggestionPort(
  value: unknown,
): value is EngagementSuggestionPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementSuggestionPort).createSuggestion ===
      "function" &&
    typeof (value as EngagementSuggestionPort).resolveSuggestion ===
      "function"
  );
}
