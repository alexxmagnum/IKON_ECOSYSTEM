import type {
  CreatePaymentInput,
  Payment,
  PaymentKind,
  PaymentStatus,
} from "./payment";
import {
  PAYMENT_RAIL_REF_KEY,
  PAYMENT_STATUSES,
  isPaymentKind,
  isPaymentStatus,
} from "./payment";

let paymentSequence = 0;

export interface CreatePaymentOptions {
  /**
   * When set, payment may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Payment (in-memory — payment-operation existence only).
 * Does not open vendor sessions or run capture / collect / cart flows.
 */
export function createPayment(
  input: CreatePaymentInput,
  options: CreatePaymentOptions = {},
): Payment {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const commerceReference = input.commerceReference?.trim();
  const bookingReference = input.bookingReference?.trim();
  const customerReference = input.customerReference?.trim();
  const actorReference = input.actorReference?.trim();
  const currencyReference = input.currencyReference?.trim();
  const amountReference = input.amountReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentPaymentReference = input.parentPaymentReference?.trim();
  const railRaw = input[PAYMENT_RAIL_REF_KEY];
  const railReference =
    typeof railRaw === "string" ? railRaw.trim() : undefined;
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
  if (input.customerReference !== undefined && !customerReference) {
    throw new Error("customerReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.currencyReference !== undefined && !currencyReference) {
    throw new Error("currencyReference must not be empty when provided");
  }
  if (input.amountReference !== undefined && !amountReference) {
    throw new Error("amountReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (
    input.parentPaymentReference !== undefined &&
    !parentPaymentReference
  ) {
    throw new Error(
      "parentPaymentReference must not be empty when provided",
    );
  }
  if (railRaw !== undefined && !railReference) {
    throw new Error(
      `${PAYMENT_RAIL_REF_KEY} must not be empty when provided`,
    );
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
    ...(customerReference !== undefined && customerReference.length > 0
      ? { customerReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(currencyReference !== undefined && currencyReference.length > 0
      ? { currencyReference }
      : {}),
    ...(amountReference !== undefined && amountReference.length > 0
      ? { amountReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentPaymentReference !== undefined &&
    parentPaymentReference.length > 0
      ? { parentPaymentReference }
      : {}),
    ...(railReference !== undefined && railReference.length > 0
      ? { [PAYMENT_RAIL_REF_KEY]: railReference }
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
