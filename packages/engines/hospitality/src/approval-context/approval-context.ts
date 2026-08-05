/**
 * Hospitality Engagement Approval Context — human review frame only.
 * Bridge only: Decision Proposal → Approval Context → future Action Intent.
 *
 * Distinct from Proposal (possibility), Approval Decision (outcome), and Action (side effect).
 * An approval context prepares review — it does not settle or run anything.
 *
 * @see DEC-HOSPITALITY-ENGAGEMENT-APPROVAL-CONTEXT-001
 */

/** Internal approval-context kinds — review frames, not settled outcomes. */
export const ENGAGEMENT_APPROVAL_CONTEXT_KINDS = {
  /** Review of a contextual proposal. */
  Proposal: "approval.proposal",
  /** Review related to an activity. */
  Activity: "approval.activity",
  /** Review related to community. */
  Community: "approval.community",
  /** Review related to business. */
  Business: "approval.business",
  /** Review related to experience. */
  Experience: "approval.experience",
  /** Internal MotanOS hospitality approval context. */
  Internal: "approval.internal",
} as const;

export type EngagementApprovalContextKind =
  (typeof ENGAGEMENT_APPROVAL_CONTEXT_KINDS)[keyof typeof ENGAGEMENT_APPROVAL_CONTEXT_KINDS];

export const ENGAGEMENT_APPROVAL_CONTEXT_KIND_VALUES = Object.values(
  ENGAGEMENT_APPROVAL_CONTEXT_KINDS,
) as readonly EngagementApprovalContextKind[];

/** Approval-context lifecycle status (existence labels only — no settle runtime). */
export const ENGAGEMENT_APPROVAL_CONTEXT_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Reviewing: "reviewing",
  Approved: "approved",
  Rejected: "rejected",
  Expired: "expired",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type EngagementApprovalContextStatus =
  (typeof ENGAGEMENT_APPROVAL_CONTEXT_STATUSES)[keyof typeof ENGAGEMENT_APPROVAL_CONTEXT_STATUSES];

export const ENGAGEMENT_APPROVAL_CONTEXT_STATUS_VALUES = Object.values(
  ENGAGEMENT_APPROVAL_CONTEXT_STATUSES,
) as readonly EngagementApprovalContextStatus[];

/**
 * Opaque hospitality engagement approval context — review-frame existence only.
 * Associates a proposal with a review frame inside one Hospitality.
 * No settle payloads, access-control fields, models, or side-effect payloads.
 */
export type HospitalityEngagementApprovalContext = {
  /** Opaque unique approval reference. */
  approvalReference: string;
  /** Internal approval-context kind. */
  approvalKind: EngagementApprovalContextKind;
  /** Approval-context status. */
  approvalStatus: EngagementApprovalContextStatus;
  /** Opaque hospitality business pointer when known. */
  hospitalityReference?: string;
  /** Opaque proposal pointer when known. */
  proposalReference?: string;
  /** Opaque decision-context pointer when known. */
  decisionContextReference?: string;
  /** Opaque reviewer pointer when known. */
  reviewerReference?: string;
  /** Opaque member pointer when known. */
  memberReference?: string;
  /** Opaque activity pointer when known. */
  activityReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent approval pointer when nested. */
  parentApprovalReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
};

/**
 * Outbound port for future engagement-approval-context adapters.
 * Not wired in this foundation — existence create/resolve only.
 */
export interface EngagementApprovalContextPort {
  createApprovalContext(
    input: CreateEngagementApprovalContextInput,
  ): Promise<HospitalityEngagementApprovalContext>;
  resolveApprovalContext(
    approval: HospitalityEngagementApprovalContext,
  ): Promise<HospitalityEngagementApprovalContext>;
}

export type CreateEngagementApprovalContextInput = {
  approvalKind: EngagementApprovalContextKind;
  approvalStatus?: EngagementApprovalContextStatus;
  approvalReference?: string;
  hospitalityReference?: string;
  proposalReference?: string;
  decisionContextReference?: string;
  reviewerReference?: string;
  memberReference?: string;
  activityReference?: string;
  contextReference?: string;
  parentApprovalReference?: string;
  metadata?: Record<string, unknown>;
};

export function isEngagementApprovalContextKind(
  value: string,
): value is EngagementApprovalContextKind {
  return (
    ENGAGEMENT_APPROVAL_CONTEXT_KIND_VALUES as readonly string[]
  ).includes(value);
}

export function isEngagementApprovalContextStatus(
  value: string,
): value is EngagementApprovalContextStatus {
  return (
    ENGAGEMENT_APPROVAL_CONTEXT_STATUS_VALUES as readonly string[]
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

export function isHospitalityEngagementApprovalContext(
  value: unknown,
): value is HospitalityEngagementApprovalContext {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.approvalReference === "string" &&
    candidate.approvalReference.length > 0 &&
    optionalOpaqueOk(candidate, "hospitalityReference") &&
    optionalOpaqueOk(candidate, "proposalReference") &&
    optionalOpaqueOk(candidate, "decisionContextReference") &&
    optionalOpaqueOk(candidate, "reviewerReference") &&
    optionalOpaqueOk(candidate, "memberReference") &&
    optionalOpaqueOk(candidate, "activityReference") &&
    optionalOpaqueOk(candidate, "contextReference") &&
    optionalOpaqueOk(candidate, "parentApprovalReference") &&
    typeof candidate.approvalKind === "string" &&
    isEngagementApprovalContextKind(candidate.approvalKind) &&
    typeof candidate.approvalStatus === "string" &&
    isEngagementApprovalContextStatus(candidate.approvalStatus)
  );
}

export function isEngagementApprovalContextPort(
  value: unknown,
): value is EngagementApprovalContextPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as EngagementApprovalContextPort).createApprovalContext ===
      "function" &&
    typeof (value as EngagementApprovalContextPort).resolveApprovalContext ===
      "function"
  );
}
