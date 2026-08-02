/**
 * @motanos/policy — Policy Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/policy
 *
 * Policy = configurable business rules and decision conditions.
 * Domain engines own operations; access control owns who may act;
 * process orchestration owns step sequences.
 *
 * Must not depend on booking, membership, commerce, identity,
 * access-control packages, or persistence vendors.
 *
 * @see DEC-POLICY-BOUNDARY-001
 */

export const POLICY_ENGINE = "@motanos/policy" as const;

export type {
  CreatePolicyInput,
  CreatePolicyOptions,
  Policy,
  PolicyKind,
  PolicyPort,
  PolicyStatus,
} from "./policies";
export {
  POLICY_KINDS,
  POLICY_KIND_VALUES,
  POLICY_STATUSES,
  POLICY_STATUS_VALUES,
  createPolicy,
  isPolicy,
  isPolicyKind,
  isPolicyPort,
  isPolicyStatus,
  resetPolicyReferenceSequence,
} from "./policies";
