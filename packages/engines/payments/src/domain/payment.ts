import type { PaymentStatus, RefundStatus } from "../types/states";

export type PaymentId = string;
export type PaymentIntentId = string;
export type UserId = string;
export type RefundId = string;

/**
 * Monetary amount in minor units (e.g. cents) plus ISO-4217 currency code.
 * Display amounts must equal final amounts (SoT RB-005).
 */
export interface Money {
  /** Integer minor units; never a floating display string. */
  amount: number;
  /** ISO-4217 code (e.g. "EUR"). */
  currency: string;
}

/**
 * Opaque link to a consuming aggregate.
 * Payment does not interpret `kind` — consumers supply their own vocabulary.
 */
export interface ConsumerReference {
  kind: string;
  id: string;
}

/**
 * "I want to perform a payment" — initiation of a charge lifecycle.
 * Distinct from a settled/captured Payment outcome.
 */
export interface PaymentIntent {
  id: PaymentIntentId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  ownerUserId: UserId;
  /** Provider-side reference when a gateway has accepted the intent. */
  externalReference?: string;
  consumerReference?: ConsumerReference;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payment aggregate tracking the full PAYMENT machine lifecycle.
 * Optional consumerReference keeps domain coupling out of this engine.
 */
export interface Payment {
  id: PaymentId;
  /** Originating intent when the flow started as PaymentIntent. */
  intentId?: PaymentIntentId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  ownerUserId: UserId;
  externalReference?: string;
  consumerReference?: ConsumerReference;
  /** Cumulative amount refunded in minor units. */
  refundedAmount?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/** Individual refund subprocess record (statuses from Payments module). */
export interface Refund {
  id: RefundId;
  paymentId: PaymentId;
  amount: number;
  currency: string;
  status: RefundStatus;
  externalReference?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
