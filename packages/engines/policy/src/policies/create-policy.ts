import type {
  CreatePolicyInput,
  Policy,
  PolicyKind,
  PolicyStatus,
} from "./policy";
import {
  POLICY_CAPACITY_REF_KEY,
  POLICY_STATUSES,
  isPolicyKind,
  isPolicyStatus,
} from "./policy";

let policySequence = 0;

export interface CreatePolicyOptions {
  /**
   * When set, policy may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Policy (in-memory — condition / constraint existence only).
 * Does not score outcomes, apply constraints, or open vendor sessions.
 */
export function createPolicy(
  input: CreatePolicyInput,
  options: CreatePolicyOptions = {},
): Policy {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const membershipReference = input.membershipReference?.trim();
  const contextReference = input.contextReference?.trim();
  const resourceReference = input.resourceReference?.trim();
  const conditionReference = input.conditionReference?.trim();
  const actionReference = input.actionReference?.trim();
  const parentPolicyReference = input.parentPolicyReference?.trim();
  const capacityRaw = input[POLICY_CAPACITY_REF_KEY];
  const capacityReference =
    typeof capacityRaw === "string" ? capacityRaw.trim() : undefined;
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isPolicyKind(input.policyKind)) {
    throw new Error(`Unknown policy kind: ${String(input.policyKind)}`);
  }

  const policyStatus: PolicyStatus =
    input.policyStatus ?? POLICY_STATUSES.Draft;
  if (!isPolicyStatus(policyStatus)) {
    throw new Error(`Unknown policy status: ${String(input.policyStatus)}`);
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.membershipReference !== undefined && !membershipReference) {
    throw new Error("membershipReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.resourceReference !== undefined && !resourceReference) {
    throw new Error("resourceReference must not be empty when provided");
  }
  if (input.conditionReference !== undefined && !conditionReference) {
    throw new Error("conditionReference must not be empty when provided");
  }
  if (input.actionReference !== undefined && !actionReference) {
    throw new Error("actionReference must not be empty when provided");
  }
  if (input.parentPolicyReference !== undefined && !parentPolicyReference) {
    throw new Error("parentPolicyReference must not be empty when provided");
  }
  if (capacityRaw !== undefined && !capacityReference) {
    throw new Error(
      `${POLICY_CAPACITY_REF_KEY} must not be empty when provided`,
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("policy does not apply to this tenant");
  }

  const providedReference = input.policyReference?.trim() ?? "";
  if (input.policyReference !== undefined && !providedReference) {
    throw new Error("policyReference must not be empty when provided");
  }

  const policyKind: PolicyKind = input.policyKind;
  const policyReference = providedReference || allocatePolicyReference();

  return {
    policyReference,
    tenantReference,
    policyKind,
    policyStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(membershipReference !== undefined && membershipReference.length > 0
      ? { membershipReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(resourceReference !== undefined && resourceReference.length > 0
      ? { resourceReference }
      : {}),
    ...(conditionReference !== undefined && conditionReference.length > 0
      ? { conditionReference }
      : {}),
    ...(actionReference !== undefined && actionReference.length > 0
      ? { actionReference }
      : {}),
    ...(parentPolicyReference !== undefined &&
    parentPolicyReference.length > 0
      ? { parentPolicyReference }
      : {}),
    ...(capacityReference !== undefined && capacityReference.length > 0
      ? { [POLICY_CAPACITY_REF_KEY]: capacityReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocatePolicyReference(): string {
  policySequence += 1;
  return `policy-${policySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetPolicyReferenceSequence(): void {
  policySequence = 0;
}
