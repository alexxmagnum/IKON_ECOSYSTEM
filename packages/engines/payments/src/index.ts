/**
 * @motanos/payments — Shared Payments Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/payments → Domain Modules
 *
 * Must not depend on customer implementations, concrete domains,
 * other shared engines, database packages, or payment gateways.
 */

export const PAYMENTS_ENGINE = "@motanos/payments" as const;

export type {
  ConsumerReference,
  Money,
  Payment,
  PaymentId,
  PaymentIntent,
  PaymentIntentId,
  Refund,
  RefundId,
  UserId,
} from "./domain/payment";

export type {
  PaymentEvent,
  PaymentFinalStatus,
  PaymentStatus,
  RefundStatus,
} from "./types/states";
export {
  allowedPaymentTargets,
  canTransitionPayment,
  isCaptured,
  isPaymentFinal,
  isPaymentStatus,
  mayAcceptRefund,
  PAYMENT_CAPTURABLE_STATUSES,
  PAYMENT_EVENTS,
  PAYMENT_FINAL_STATUSES,
  PAYMENT_REFUNDABLE_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_TRANSITIONS,
  REFUND_STATUSES,
} from "./types/states";

export type {
  CancelPaymentInput,
  CapturePaymentInput,
  CreatePaymentIntentInput,
  GetPaymentQuery,
  ListPaymentsQuery,
  PaymentIntentResult,
  PaymentResult,
  RefundPaymentInput,
  RefundResult,
  UpdatePaymentStatusInput,
} from "./contracts";

export type { PaymentService } from "./services";

export type {
  CaptureProviderPaymentParams,
  CreateProviderIntentParams,
  PaymentProvider,
  ProviderIntentResult,
  ProviderRefundResult,
  RefundProviderPaymentParams,
} from "./adapters";
