/**
 * @motanos/billing — Billing Engine Boundary foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/billing
 *
 * Billing = economic-record existence for a business context.
 * Must not depend on payment packages, tariff packages, document renderers,
 * levy engines, ledger vendors, or collect-rail SDKs.
 *
 * @see DEC-BILLING-BOUNDARY-001
 */

export const BILLING_ENGINE = "@motanos/billing" as const;

export type {
  CreateBillingInput,
  CreateBillingOptions,
  Billing,
  BillingKind,
  BillingPort,
  BillingStatus,
} from "./billings";
export {
  BILLING_KINDS,
  BILLING_KIND_VALUES,
  BILLING_LEVY_REF_KEY,
  BILLING_STATUSES,
  BILLING_STATUS_VALUES,
  createBilling,
  isBilling,
  isBillingKind,
  isBillingPort,
  isBillingStatus,
  resetBillingReferenceSequence,
} from "./billings";
