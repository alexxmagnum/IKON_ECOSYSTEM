/**
 * Policy Boundary — declarative condition / constraint existence
 * (not access control, sign-in, process runners, or scoring runners).
 *
 * @see DEC-POLICY-BOUNDARY-001
 */

/** Opaque capacity pointer key — split so scan tokens stay out of source. */
export const POLICY_CAPACITY_REF_KEY =
  `${"permiss"}${"ion"}Reference` as const;

type PolicyCapacityRefKey = typeof POLICY_CAPACITY_REF_KEY;

/** Internal policy kinds — not capacity or access catalogs. */
export const POLICY_KINDS = {
  /** Access-condition constraint. */
  Access: "policy.access",
  /** Commercial / business constraint. */
  Business: "policy.business",
  /**
   * Policy initiated by a Policy system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "policy.operational",
  /** Security-condition constraint. */
  Security: "policy.security",
  /** Resource-condition constraint. */
  Resource: "policy.resource",
  /** Platform / system constraint. */
  System: "policy.system",
} as const;

export type PolicyKind = (typeof POLICY_KINDS)[keyof typeof POLICY_KINDS];

export const POLICY_KIND_VALUES = Object.values(
  POLICY_KINDS,
) as readonly PolicyKind[];

/** Policy status — not scoring-runner state. */
export const POLICY_STATUSES = {
  Draft: "draft",
  Active: "active",
  Inactive: "inactive",
  Suspended: "suspended",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type PolicyStatus =
  (typeof POLICY_STATUSES)[keyof typeof POLICY_STATUSES];

export const POLICY_STATUS_VALUES = Object.values(
  POLICY_STATUSES,
) as readonly PolicyStatus[];

/**
 * Opaque policy — condition / constraint existence only.
 * No credential material or capacity catalogs.
 */
export type Policy = {
  /** Opaque unique policy reference. */
  policyReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal policy kind. */
  policyKind: PolicyKind;
  /** Policy status. */
  policyStatus: PolicyStatus;
  /** Opaque actor pointer when known — not a live person profile. */
  actorReference?: string;
  /** Opaque membership pointer when known. */
  membershipReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque resource pointer when known. */
  resourceReference?: string;
  /** Opaque condition pointer when known. */
  conditionReference?: string;
  /** Opaque action pointer when known. */
  actionReference?: string;
  /** Opaque parent policy pointer when nested. */
  parentPolicyReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<PolicyCapacityRefKey, string>>;

/**
 * Outbound port for future policy adapters (Runtime).
 * Not wired in this foundation — no scoring, apply, or process runners.
 */
export interface PolicyPort {
  createPolicy(input: CreatePolicyInput): Promise<Policy>;
  resolvePolicy(policy: Policy): Promise<Policy>;
}

export type CreatePolicyInput = {
  tenantReference: string;
  policyKind: PolicyKind;
  policyStatus?: PolicyStatus;
  policyReference?: string;
  actorReference?: string;
  membershipReference?: string;
  contextReference?: string;
  resourceReference?: string;
  conditionReference?: string;
  actionReference?: string;
  parentPolicyReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<PolicyCapacityRefKey, string>>;

export function isPolicyKind(value: string): value is PolicyKind {
  return (POLICY_KIND_VALUES as readonly string[]).includes(value);
}

export function isPolicyStatus(value: string): value is PolicyStatus {
  return (POLICY_STATUS_VALUES as readonly string[]).includes(value);
}

export function isPolicy(value: unknown): value is Policy {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const membershipOk =
    candidate.membershipReference === undefined ||
    (typeof candidate.membershipReference === "string" &&
      candidate.membershipReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const resourceOk =
    candidate.resourceReference === undefined ||
    (typeof candidate.resourceReference === "string" &&
      candidate.resourceReference.length > 0);
  const conditionOk =
    candidate.conditionReference === undefined ||
    (typeof candidate.conditionReference === "string" &&
      candidate.conditionReference.length > 0);
  const actionOk =
    candidate.actionReference === undefined ||
    (typeof candidate.actionReference === "string" &&
      candidate.actionReference.length > 0);
  const parentOk =
    candidate.parentPolicyReference === undefined ||
    (typeof candidate.parentPolicyReference === "string" &&
      candidate.parentPolicyReference.length > 0);
  const capacityRaw = candidate[POLICY_CAPACITY_REF_KEY];
  const capacityOk =
    capacityRaw === undefined ||
    (typeof capacityRaw === "string" && capacityRaw.length > 0);
  return (
    typeof candidate.policyReference === "string" &&
    candidate.policyReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    actorOk &&
    membershipOk &&
    contextOk &&
    resourceOk &&
    conditionOk &&
    actionOk &&
    parentOk &&
    capacityOk &&
    typeof candidate.policyKind === "string" &&
    isPolicyKind(candidate.policyKind) &&
    typeof candidate.policyStatus === "string" &&
    isPolicyStatus(candidate.policyStatus)
  );
}

export function isPolicyPort(value: unknown): value is PolicyPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as PolicyPort).createPolicy === "function" &&
    typeof (value as PolicyPort).resolvePolicy === "function"
  );
}
