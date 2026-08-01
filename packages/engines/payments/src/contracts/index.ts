import type {
  ConsumerReference,
  Payment,
  PaymentId,
  PaymentIntent,
  PaymentIntentId,
  Refund,
  UserId,
} from "../domain/payment";
import type { PaymentStatus } from "../types/states";

/**
 * API-oriented TypeScript contracts for a future Payments HTTP surface.
 * No route handlers or transport concerns live here.
 */

export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  ownerUserId: UserId;
  consumerReference?: ConsumerReference;
  metadata?: Record<string, unknown>;
}

export interface UpdatePaymentStatusInput {
  paymentId: PaymentId;
  status: PaymentStatus;
  externalReference?: string;
  metadata?: Record<string, unknown>;
}

export interface CapturePaymentInput {
  paymentId: PaymentId;
  /** Optional partial capture amount in minor units. */
  amount?: number;
}

export interface RefundPaymentInput {
  paymentId: PaymentId;
  amount: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface CancelPaymentInput {
  paymentId: PaymentId;
  reason?: string;
}

export interface PaymentResult {
  payment: Payment;
  intent?: PaymentIntent;
}

export interface PaymentIntentResult {
  intent: PaymentIntent;
}

export interface RefundResult {
  payment: Payment;
  refund: Refund;
}

export interface GetPaymentQuery {
  paymentId: PaymentId;
}

export interface ListPaymentsQuery {
  ownerUserId?: UserId;
  status?: PaymentStatus | PaymentStatus[];
  intentId?: PaymentIntentId;
}
