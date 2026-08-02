/**
 * @motanos/payment — Payment Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/payment
 *
 * Payment = payment intent, economic context, and lifecycle state.
 * Commerce defines acquire value; charge rails and fiscal docs live elsewhere.
 *
 * Must not depend on commerce, booking, membership, billing packages,
 * vendor SDKs, or persistence vendors.
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
  PAYMENT_STATUSES,
  PAYMENT_STATUS_VALUES,
  createPayment,
  isPayment,
  isPaymentKind,
  isPaymentPort,
  isPaymentStatus,
  resetPaymentReferenceSequence,
} from "./payments";
