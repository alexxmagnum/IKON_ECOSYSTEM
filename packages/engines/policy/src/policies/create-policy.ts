import type {
  CreatePolicyInput,
  Policy,
  PolicyKind,
  PolicyStatus,
} from "./policy";
import {
  POLICY_STATUSES,
  isPolicyKind,
  isPolicyStatus,
} from "./policy";

let policySequence = 0;

export interface CreatePolicyOptions {
  /**
   * When set, policy may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Policy (in-memory — rule definition / context only).
 * Does not score decisions, apply rules, or open vendor sessions.
 */
export function createPolicy(
  input: CreatePolicyInput,
  options: CreatePolicyOptions = {},
): Policy {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const contextReference = input.contextReference?.trim();
  const ownerReference = input.ownerReference?.trim();
  const parentPolicyReference = input.parentPolicyReference?.trim();
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

  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.ownerReference !== undefined && !ownerReference) {
    throw new Error("ownerReference must not be empty when provided");
  }
  if (input.parentPolicyReference !== undefined && !parentPolicyReference) {
    throw new Error("parentPolicyReference must not be empty when provided");
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
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(ownerReference !== undefined && ownerReference.length > 0
      ? { ownerReference }
      : {}),
    ...(parentPolicyReference !== undefined &&
    parentPolicyReference.length > 0
      ? { parentPolicyReference }
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
