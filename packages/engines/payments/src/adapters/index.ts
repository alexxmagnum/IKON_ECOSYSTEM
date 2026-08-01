import type { Money, Payment, PaymentIntent } from "../domain/payment";
import type { PaymentStatus } from "../types/states";

/**
 * Provider-agnostic gateway abstraction.
 * Concrete adapters (external PSP SDKs) are out of scope for this foundation.
 * Secrets and credentials never belong in this package (ADR-002).
 */

export interface CreateProviderIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export interface ProviderIntentResult {
  externalReference: string;
  status: PaymentStatus;
  /** Client-facing token/handle if the provider returns one — never a secret key. */
  clientToken?: string;
  raw?: Record<string, unknown>;
}

export interface CaptureProviderPaymentParams {
  externalReference: string;
  amount?: number;
}

export interface RefundProviderPaymentParams {
  externalReference: string;
  amount: number;
  reason?: string;
}

export interface ProviderRefundResult {
  externalReference: string;
  amount: number;
  status: "Pending" | "Processing" | "Completed" | "Rejected";
  raw?: Record<string, unknown>;
}

/**
 * Contract every future payment gateway adapter must satisfy.
 * No concrete provider implementations ship in this phase.
 */
export interface PaymentProvider {
  readonly name: string;

  createIntent(
    params: CreateProviderIntentParams,
  ): Promise<ProviderIntentResult>;

  capture(params: CaptureProviderPaymentParams): Promise<ProviderIntentResult>;

  refund(params: RefundProviderPaymentParams): Promise<ProviderRefundResult>;

  /**
   * Optional sync of provider state into engine vocabulary.
   * Implementations decide idempotency; foundation only declares the shape.
   */
  fetchStatus?(externalReference: string): Promise<{
    status: PaymentStatus;
    money?: Money;
    intent?: PaymentIntent;
    payment?: Payment;
  }>;
}
