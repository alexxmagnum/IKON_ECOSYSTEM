import type {
  CreateEngagementRuleInput,
  EngagementRuleKind,
  EngagementRuleStatus,
  HospitalityEngagementRule,
} from "./engagement-rule";
import {
  ENGAGEMENT_RULE_STATUSES,
  isEngagementRuleKind,
  isEngagementRuleStatus,
} from "./engagement-rule";

let engagementRuleSequence = 0;

export interface CreateEngagementRuleOptions {
  /**
   * When set, engagement rule may only be created for this hospitality business
   * (cross-business isolation).
   */
  hospitalityReference?: string;
}

/**
 * Build a checked HospitalityEngagementRule (in-memory — criterion definition only).
 * Does not run criteria, fire side effects, spawn proposals, or start pipelines.
 */
export function createEngagementRule(
  input: CreateEngagementRuleInput,
  options: CreateEngagementRuleOptions = {},
): HospitalityEngagementRule {
  const hospitalityReference = input.hospitalityReference?.trim();
  const engagementReference = input.engagementReference?.trim();
  const suggestionReference = input.suggestionReference?.trim();
  const activityReference = input.activityReference?.trim();
  const contextReference = input.contextReference?.trim();
  const memberReference = input.memberReference?.trim();
  const triggerReference = input.triggerReference?.trim();
  const policyReference = input.policyReference?.trim();
  const boundHospitality = options.hospitalityReference?.trim() || undefined;

  if (!isEngagementRuleKind(input.ruleKind)) {
    throw new Error(
      `Unknown engagement-rule kind: ${String(input.ruleKind)}`,
    );
  }

  const ruleStatus: EngagementRuleStatus =
    input.ruleStatus ?? ENGAGEMENT_RULE_STATUSES.Draft;
  if (!isEngagementRuleStatus(ruleStatus)) {
    throw new Error(
      `Unknown engagement-rule status: ${String(input.ruleStatus)}`,
    );
  }

  if (input.hospitalityReference !== undefined && !hospitalityReference) {
    throw new Error(
      "hospitalityReference must not be empty when provided",
    );
  }
  if (input.engagementReference !== undefined && !engagementReference) {
    throw new Error(
      "engagementReference must not be empty when provided",
    );
  }
  if (input.suggestionReference !== undefined && !suggestionReference) {
    throw new Error(
      "suggestionReference must not be empty when provided",
    );
  }
  if (input.activityReference !== undefined && !activityReference) {
    throw new Error("activityReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.memberReference !== undefined && !memberReference) {
    throw new Error("memberReference must not be empty when provided");
  }
  if (input.triggerReference !== undefined && !triggerReference) {
    throw new Error("triggerReference must not be empty when provided");
  }
  if (input.policyReference !== undefined && !policyReference) {
    throw new Error("policyReference must not be empty when provided");
  }

  if (
    boundHospitality !== undefined &&
    (hospitalityReference === undefined ||
      hospitalityReference !== boundHospitality)
  ) {
    throw new Error(
      "engagement rule does not apply to this hospitality business",
    );
  }

  const providedReference = input.ruleReference?.trim() ?? "";
  if (input.ruleReference !== undefined && !providedReference) {
    throw new Error("ruleReference must not be empty when provided");
  }

  const ruleKind: EngagementRuleKind = input.ruleKind;
  const ruleReference =
    providedReference || allocateEngagementRuleReference();

  return {
    ruleReference,
    ruleKind,
    ruleStatus,
    ...(hospitalityReference !== undefined && hospitalityReference.length > 0
      ? { hospitalityReference }
      : {}),
    ...(engagementReference !== undefined && engagementReference.length > 0
      ? { engagementReference }
      : {}),
    ...(suggestionReference !== undefined && suggestionReference.length > 0
      ? { suggestionReference }
      : {}),
    ...(activityReference !== undefined && activityReference.length > 0
      ? { activityReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(memberReference !== undefined && memberReference.length > 0
      ? { memberReference }
      : {}),
    ...(triggerReference !== undefined && triggerReference.length > 0
      ? { triggerReference }
      : {}),
    ...(policyReference !== undefined && policyReference.length > 0
      ? { policyReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateEngagementRuleReference(): string {
  engagementRuleSequence += 1;
  return `engagement-rule-${engagementRuleSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetEngagementRuleReferenceSequence(): void {
  engagementRuleSequence = 0;
}
