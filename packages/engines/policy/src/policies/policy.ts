/**
 * Policy Engine Boundary — configurable business rules / decision conditions
 * (not access control, capability catalogs, sign-in, process orchestration,
 * or domain engine internals).
 *
 * @see DEC-POLICY-BOUNDARY-001
 */

/** Internal policy kinds — not capability or access catalogs. */
export const POLICY_KINDS = {
  /** Commercial / business rule. */
  Business: "policy.business",
  /** Membership condition rule. */
  Membership: "policy.membership",
  /** Booking condition rule. */
  Booking: "policy.booking",
  /** Commerce / economic condition rule. */
  Commerce: "policy.commerce",
  /** Resource constraint rule. */
  Resource: "policy.resource",
  /**
   * Policy initiated by a Policy system operation.
   * Not a technical infrastructure error.
   */
  Operational: "policy.operational",
} as const;

export type PolicyKind = (typeof POLICY_KINDS)[keyof typeof POLICY_KINDS];

export const POLICY_KIND_VALUES = Object.values(
  POLICY_KINDS,
) as readonly PolicyKind[];

/** Policy definition status — not decision-runtime state. */
export const POLICY_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Expired: "expired",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type PolicyStatus =
  (typeof POLICY_STATUSES)[keyof typeof POLICY_STATUSES];

export const POLICY_STATUS_VALUES = Object.values(
  POLICY_STATUSES,
) as readonly PolicyStatus[];

/**
 * Opaque policy definition — conditions and application context only.
 * No credential material or capability catalogs.
 */
export interface Policy {
  /** Opaque unique policy reference. */
  policyReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal policy kind. */
  policyKind: PolicyKind;
  /** Policy definition status. */
  policyStatus: PolicyStatus;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque decision-context pointer when known. */
  contextReference?: string;
  /** Opaque owner pointer when known. */
  ownerReference?: string;
  /** Opaque parent policy pointer when nested. */
  parentPolicyReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future policy adapters (Runtime).
 * Not wired in this foundation — no decision scoring, apply, or rule-running.
 */
export interface PolicyPort {
  createPolicy(input: CreatePolicyInput): Promise<Policy>;
  resolvePolicy(policy: Policy): Promise<Policy>;
}

export interface CreatePolicyInput {
  tenantReference: string;
  policyKind: PolicyKind;
  policyStatus?: PolicyStatus;
  policyReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  contextReference?: string;
  ownerReference?: string;
  parentPolicyReference?: string;
  metadata?: Record<string, unknown>;
}

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
  const nameOk =
    candidate.nameReference === undefined ||
    (typeof candidate.nameReference === "string" &&
      candidate.nameReference.length > 0);
  const descriptionOk =
    candidate.descriptionReference === undefined ||
    (typeof candidate.descriptionReference === "string" &&
      candidate.descriptionReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const ownerOk =
    candidate.ownerReference === undefined ||
    (typeof candidate.ownerReference === "string" &&
      candidate.ownerReference.length > 0);
  const parentOk =
    candidate.parentPolicyReference === undefined ||
    (typeof candidate.parentPolicyReference === "string" &&
      candidate.parentPolicyReference.length > 0);
  return (
    typeof candidate.policyReference === "string" &&
    candidate.policyReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    contextOk &&
    ownerOk &&
    parentOk &&
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
