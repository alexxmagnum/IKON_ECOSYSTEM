/**
 * Hospitality Engagement Rule — contextual criterion definition only.
 * Bridge only: Engagement / Suggestion → Rule → future Copilot / Actions.
 *
 * Distinct from Suggestion (proposal) and from Action (something that occurs).
 * A rule defines when something may be relevant — it does not run anything.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-RULE-CONTEXT-001
 */

/** Internal engagement-rule kinds — criterion modes, not runnable policies. */
export const ENGAGEMENT_RULE_KINDS = {
  /** Criterion about person–business relationship. */
  Engagement: "rule.engagement",
  /** Criterion about activities. */
  Activity: "rule.activity",
  /** Criterion about community. */
  Community: "rule.community",
  /** Criterion about members. */
  Member: "rule.member",
  /** Criterion about business opportunities. */
  Business: "rule.business",
  /** Internal MotanOS hospitality engagement rule. */
  Internal: "rule.internal",
} as const;

export type EngagementRuleKind =
  (typeof ENGAGEMENT_RULE_KINDS)[keyof typeof ENGAGEMENT_RULE_KINDS];

export const ENGAGEMENT_RULE_KIND_VALUES = Object.values(
  ENGAGEMENT_RULE_KINDS,
) as readonly EngagementRuleKind[];

/** Engagement-rule lifecycle status (existence labels only — no runtimes). */
export const ENGAGEMENT_RULE_STATUSES = {
  Draft: "draft",
  Configured: "configured",
  Active: "active",
  Paused: "paused",
  Disabled: "disabled",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type EngagementRuleStatus =
  (typeof ENGAGEMENT_RULE_STATUSES)[keyof typeof ENGAGEMENT_RULE_STATUSES];

export const ENGAGEMENT_RULE_STATUS_VALUES = Object.values(
  ENGAGEMENT_RULE_STATUSES,
) as readonly EngagementRuleStatus[];

/**
 * Opaque hospitality engagement rule — criterion existence only.
 * Describes a contextual condition related to engagement.
 * No prompts, models, runtimes, workflows, incentives, or metric payloads.
 */
export type HospitalityEngagementRule = {
  /** Opaque unique rule reference. */
  ruleReference: string;
  /** Internal engagement-rule kind. */
  ruleKind: EngagementRuleKind;
  /** Engagement-rule status. */
  ruleStatus: EngagementRuleStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque engagement pointer when known. */
  engagementReference?: string;
  /** Opaque suggestion pointer when known. */
  suggestionReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque trigger pointer when known (definition only). */
  triggerReference?: string;
  /** Opaque policy pointer when known (definition only). */
  policyReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-rule adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementRulePort {
  createEngagementRule(
    input: CreateEngagementRuleInput,
  ): Promise<HospitalityEngagementRule>;
  resolveEngagementRule(
    rule: HospitalityEngagementRule,
  ): Promise<HospitalityEngagementRule>;
}

export type CreateEngagementRuleInput = {
  ruleKind: EngagementRuleKind;
  ruleStatus?: EngagementRuleStatus;
  ruleReference?: string;
  hospitalityReference?: string;
  engagementReference?: string;
  suggestionReference?: string;
  activityReference?: string;
  contextReference?: string;
  memberReference?: string;
  triggerReference?: string;
  policyReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementRuleKind(
  value: string,
): value is EngagementRuleKind {
  return (ENGAGEMENT_RULE_KIND_VALUES as readonly string[]).includes(value);
}

export function isEngagementRuleStatus(
  value: string,
): value is EngagementRuleStatus {
  return (ENGAGEMENT_RULE_STATUS_VALUES as readonly string[]).includes(value);
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

export function isHospitalityEngagementRule(
  value: unknown,
): value is HospitalityEngagementRule {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.ruleReference === "string" &&
    candidate.ruleReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "engagementReference") &&
    optionalOpaqueOk(candidate, "suggestionReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "triggerReference") &&
    optionalOpaqueOk(candidate, "policyReference") &&
    typeof candidate.ruleKind === "string" &&
    isEngagementRuleKind(candidate.ruleKind) &&
    typeof candidate.ruleStatus === "string" &&
    isEngagementRuleStatus(candidate.ruleStatus)
  );
}

export function isEngagementRulePort(
  value: unknown,
): value is EngagementRulePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementRulePort).createEngagementRule ===
      "function" &&
    typeof (value as EngagementRulePort).resolveEngagementRule ===
      "function"
  );
}
