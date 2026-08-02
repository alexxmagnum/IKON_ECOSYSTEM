import type {
  CreatePaymentInput,
  Payment,
  PaymentKind,
  PaymentStatus,
} from "./payment";
import { PAYMENT_STATUSES, isPaymentKind, isPaymentStatus } from "./payment";

let paymentSequence = 0;

export interface CreatePaymentOptions {
  /**
   * When set, payment may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated Payment (in-memory — intent / context only).
 * Does not capture funds, process methods, or open vendor sessions.
 */
export function createPayment(
  input: CreatePaymentInput,
  options: CreatePaymentOptions = {},
): Payment {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const commerceReference = input.commerceReference?.trim();
  const bookingReference = input.bookingReference?.trim();
  const membershipReference = input.membershipReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const amountReference = input.amountReference?.trim();
  const currencyReference = input.currencyReference?.trim();
  const providerReference = input.providerReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isPaymentKind(input.paymentKind)) {
    throw new Error(`Unknown payment kind: ${String(input.paymentKind)}`);
  }

  const paymentStatus: PaymentStatus =
    input.paymentStatus ?? PAYMENT_STATUSES.Draft;
  if (!isPaymentStatus(paymentStatus)) {
    throw new Error(
      `Unknown payment status: ${String(input.paymentStatus)}`,
    );
  }

  if (input.commerceReference !== undefined && !commerceReference) {
    throw new Error("commerceReference must not be empty when provided");
  }
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.membershipReference !== undefined && !membershipReference) {
    throw new Error("membershipReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error("experienceReference must not be empty when provided");
  }
  if (input.amountReference !== undefined && !amountReference) {
    throw new Error("amountReference must not be empty when provided");
  }
  if (input.currencyReference !== undefined && !currencyReference) {
    throw new Error("currencyReference must not be empty when provided");
  }
  if (input.providerReference !== undefined && !providerReference) {
    throw new Error("providerReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("payment does not apply to this tenant");
  }

  const providedReference = input.paymentReference?.trim() ?? "";
  if (input.paymentReference !== undefined && !providedReference) {
    throw new Error("paymentReference must not be empty when provided");
  }

  const paymentKind: PaymentKind = input.paymentKind;
  const paymentReference = providedReference || allocatePaymentReference();

  return {
    paymentReference,
    tenantReference,
    paymentKind,
    paymentStatus,
    ...(commerceReference !== undefined && commerceReference.length > 0
      ? { commerceReference }
      : {}),
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(membershipReference !== undefined && membershipReference.length > 0
      ? { membershipReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(amountReference !== undefined && amountReference.length > 0
      ? { amountReference }
      : {}),
    ...(currencyReference !== undefined && currencyReference.length > 0
      ? { currencyReference }
      : {}),
    ...(providerReference !== undefined && providerReference.length > 0
      ? { providerReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocatePaymentReference(): string {
  paymentSequence += 1;
  return `payment-${paymentSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetPaymentReferenceSequence(): void {
  paymentSequence = 0;
}
