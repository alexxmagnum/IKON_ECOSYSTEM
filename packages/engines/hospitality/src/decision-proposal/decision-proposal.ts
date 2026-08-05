/**
 * Hospitality Engagement Decision Proposal — pending contextual proposal only.
 * Bridge only: Decision Context → Decision Proposal → future review / Decision layer.
 *
 * Distinct from Decision Context (situation), Decision (outcome), and Suggestion (community idea).
 * A proposal states a possibility for later review — it does not approve or run anything.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-DECISION-PROPOSAL-CONTEXT-001
 */

/** Internal decision-proposal kinds — possibility modes, not approved outcomes. */
export const ENGAGEMENT_DECISION_PROPOSAL_KINDS = {
  /** Possibility about person–business relationship. */
  Engagement: "proposal.engagement",
  /** Possibility about activities. */
  Activity: "proposal.activity",
  /** Possibility about community. */
  Community: "proposal.community",
  /** Possibility about members. */
  Member: "proposal.member",
  /** Possibility about business opportunities. */
  Business: "proposal.business",
  /** Possibility about visitor experience. */
  Experience: "proposal.experience",
  /** Internal MotanOS hospitality decision proposal. */
  Internal: "proposal.internal",
} as const;

export type EngagementDecisionProposalKind =
  (typeof ENGAGEMENT_DECISION_PROPOSAL_KINDS)[keyof typeof ENGAGEMENT_DECISION_PROPOSAL_KINDS];

export const ENGAGEMENT_DECISION_PROPOSAL_KIND_VALUES = Object.values(
  ENGAGEMENT_DECISION_PROPOSAL_KINDS,
) as readonly EngagementDecisionProposalKind[];

/** Decision-proposal lifecycle status (existence labels only — no conversion runtime). */
export const ENGAGEMENT_DECISION_PROPOSAL_STATUSES = {
  Draft: "draft",
  Generated: "generated",
  Review: "review",
  Accepted: "accepted",
  Rejected: "rejected",
  Converted: "converted",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type EngagementDecisionProposalStatus =
  (typeof ENGAGEMENT_DECISION_PROPOSAL_STATUSES)[keyof typeof ENGAGEMENT_DECISION_PROPOSAL_STATUSES];

export const ENGAGEMENT_DECISION_PROPOSAL_STATUS_VALUES = Object.values(
  ENGAGEMENT_DECISION_PROPOSAL_STATUSES,
) as readonly EngagementDecisionProposalStatus[];

/**
 * Opaque hospitality engagement decision proposal — pending possibility only.
 * May later convert to Activity; conversion runtime is deferred.
 * No outcomes, confidence metrics, prompts, models, or side-effect payloads.
 */
export type HospitalityEngagementDecisionProposal = {
  /** Opaque unique proposal reference. */
  proposalReference: string;
  /** Internal decision-proposal kind. */
  proposalKind: EngagementDecisionProposalKind;
  /** Decision-proposal status. */
  proposalStatus: EngagementDecisionProposalStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque decision-context pointer when known. */
  decisionContextReference?: string;
  /** Opaque signal pointer when known. */
  signalReference?: string;
  /** Opaque rule pointer when known. */
  ruleReference?: string;
  /** Opaque suggestion pointer when known. */
  suggestionReference?: string;
  /** Opaque related activity pointer when known (not a conversion result). */
  activityReference?: string;
  /** Opaque community pointer when known. */
  communityReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque creator pointer when known. */
  creatorReference?: string;
  /** Opaque parent proposal pointer when nested. */
  parentProposalReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-decision-proposal adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementDecisionProposalPort {
  createDecisionProposal(
    input: CreateEngagementDecisionProposalInput,
  ): Promise<HospitalityEngagementDecisionProposal>;
  resolveDecisionProposal(
    proposal: HospitalityEngagementDecisionProposal,
  ): Promise<HospitalityEngagementDecisionProposal>;
}

export type CreateEngagementDecisionProposalInput = {
  proposalKind: EngagementDecisionProposalKind;
  proposalStatus?: EngagementDecisionProposalStatus;
  proposalReference?: string;
  hospitalityReference?: string;
  decisionContextReference?: string;
  signalReference?: string;
  ruleReference?: string;
  suggestionReference?: string;
  activityReference?: string;
  communityReference?: string;
  memberReference?: string;
  contextReference?: string;
  creatorReference?: string;
  parentProposalReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementDecisionProposalKind(
  value: string,
): value is EngagementDecisionProposalKind {
  return (
    ENGAGEMENT_DECISION_PROPOSAL_KIND_VALUES as readonly string[]
  ).includes(value);
}

export function isEngagementDecisionProposalStatus(
  value: string,
): value is EngagementDecisionProposalStatus {
  return (
    ENGAGEMENT_DECISION_PROPOSAL_STATUS_VALUES as readonly string[]
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

export function isHospitalityEngagementDecisionProposal(
  value: unknown,
): value is HospitalityEngagementDecisionProposal {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.proposalReference === "string" &&
    candidate.proposalReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "decisionContextReference") &&
    optionalOpaqueOk(candidate, "signalReference") &&
    optionalOpaqueOk(candidate, "ruleReference") &&
    optionalOpaqueOk(candidate, "suggestionReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "communityReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "creatorReference") &&
    optionalOpaqueOk(candidate, "parentProposalReference") &&
    typeof candidate.proposalKind === "string" &&
    isEngagementDecisionProposalKind(candidate.proposalKind) &&
    typeof candidate.proposalStatus === "string" &&
    isEngagementDecisionProposalStatus(candidate.proposalStatus)
  );
}

export function isEngagementDecisionProposalPort(
  value: unknown,
): value is EngagementDecisionProposalPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementDecisionProposalPort)
      .createDecisionProposal === "function" &&
    typeof (value as EngagementDecisionProposalPort)
      .resolveDecisionProposal === "function"
  );
}
