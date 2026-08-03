/**
 * @motanos/payment — Payment Engine Boundary foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/payment
 *
 * Payment = payment-operation existence for a business context.
 * Must not depend on commerce packages, tariff packages, fiscal packages,
 * cart packages, collect-rail SDKs, or persistence vendors.
 *
 * Distinct from legacy `@motanos/payments` package scaffolding.
 *
 * @see DEC-PAYMENT-BOUNDARY-001
 */

export const PAYMENT_ENGINE = "@motanos/payment" as const;

export type {
  CreatePaymentInput,
  CreatePaymentOptions,
  Payment,
  PaymentKind,
  PaymentPort,
  PaymentStatus,
} from "./payments";
export {
  PAYMENT_KINDS,
  PAYMENT_KIND_VALUES,
  PAYMENT_RAIL_REF_KEY,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_VALUES,
  createPayment,
  isPayment,
  isPaymentKind,
  isPaymentPort,
  isPaymentStatus,
  resetPaymentReferenceSequence,
} from "./payments";
