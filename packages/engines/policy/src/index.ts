/**
 * @motanos/policy — Policy Boundary foundation.
 *
 * MotanOS Core → Shared packages → @motanos/policy
 *
 * Policy = declarative condition / constraint existence for a context.
 * Must not depend on capacity packages, sign-in packages, process packages,
 * settings packages, or scoring runners.
 *
 * @see DEC-POLICY-BOUNDARY-001
 */

export const POLICY_BOUNDARY = "@motanos/policy" as const;

export type {
  CreatePolicyInput,
  CreatePolicyOptions,
  Policy,
  PolicyKind,
  PolicyPort,
  PolicyStatus,
} from "./policies";
export {
  POLICY_CAPACITY_REF_KEY,
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
