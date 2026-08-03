import type {
  CreateBillingInput,
  Billing,
  BillingKind,
  BillingStatus,
} from "./billing";
import {
  BILLING_LEVY_REF_KEY,
  BILLING_STATUSES,
  isBillingKind,
  isBillingStatus,
} from "./billing";

let billingSequence = 0;

export interface CreateBillingOptions {
  /**
   * When set, billing may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Billing (in-memory — economic-record existence only).
 * Does not render documents, compute levies, or sync ledgers.
 */
export function createBilling(
  input: CreateBillingInput,
  options: CreateBillingOptions = {},
): Billing {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const commerceReference = input.commerceReference?.trim();
  const paymentReference = input.paymentReference?.trim();
  const customerReference = input.customerReference?.trim();
  const actorReference = input.actorReference?.trim();
  const currencyReference = input.currencyReference?.trim();
  const amountReference = input.amountReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentBillingReference = input.parentBillingReference?.trim();
  const levyRaw = input[BILLING_LEVY_REF_KEY];
  const levyReference =
    typeof levyRaw === "string" ? levyRaw.trim() : undefined;
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isBillingKind(input.billingKind)) {
    throw new Error(`Unknown billing kind: ${String(input.billingKind)}`);
  }

  const billingStatus: BillingStatus =
    input.billingStatus ?? BILLING_STATUSES.Draft;
  if (!isBillingStatus(billingStatus)) {
    throw new Error(
      `Unknown billing status: ${String(input.billingStatus)}`,
    );
  }

  if (input.commerceReference !== undefined && !commerceReference) {
    throw new Error("commerceReference must not be empty when provided");
  }
  if (input.paymentReference !== undefined && !paymentReference) {
    throw new Error("paymentReference must not be empty when provided");
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
    input.parentBillingReference !== undefined &&
    !parentBillingReference
  ) {
    throw new Error(
      "parentBillingReference must not be empty when provided",
    );
  }
  if (levyRaw !== undefined && !levyReference) {
    throw new Error(
      `${BILLING_LEVY_REF_KEY} must not be empty when provided`,
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("billing does not apply to this tenant");
  }

  const providedReference = input.billingReference?.trim() ?? "";
  if (input.billingReference !== undefined && !providedReference) {
    throw new Error("billingReference must not be empty when provided");
  }

  const billingKind: BillingKind = input.billingKind;
  const billingReference = providedReference || allocateBillingReference();

  return {
    billingReference,
    tenantReference,
    billingKind,
    billingStatus,
    ...(commerceReference !== undefined && commerceReference.length > 0
      ? { commerceReference }
      : {}),
    ...(paymentReference !== undefined && paymentReference.length > 0
      ? { paymentReference }
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
    ...(parentBillingReference !== undefined &&
    parentBillingReference.length > 0
      ? { parentBillingReference }
      : {}),
    ...(levyReference !== undefined && levyReference.length > 0
      ? { [BILLING_LEVY_REF_KEY]: levyReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateBillingReference(): string {
  billingSequence += 1;
  return `billing-${billingSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBillingReferenceSequence(): void {
  billingSequence = 0;
}
