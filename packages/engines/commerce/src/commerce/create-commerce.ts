import type {
  Commerce,
  CommerceKind,
  CommerceStatus,
  CreateCommerceInput,
} from "./commerce";
import {
  COMMERCE_STATUSES,
  COMMERCE_TARIFF_REF_KEY,
  isCommerceKind,
  isCommerceStatus,
} from "./commerce";

let commerceSequence = 0;

export interface CreateCommerceOptions {
  /**
   * When set, commerce may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Commerce (in-memory — commercial-operation existence only).
 * Does not open vendor sessions or run cart / collect / fiscal flows.
 */
export function createCommerce(
  input: CreateCommerceInput,
  options: CreateCommerceOptions = {},
): Commerce {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const catalogReference = input.catalogReference?.trim();
  const customerReference = input.customerReference?.trim();
  const actorReference = input.actorReference?.trim();
  const bookingReference = input.bookingReference?.trim();
  const contextReference = input.contextReference?.trim();
  const parentCommerceReference = input.parentCommerceReference?.trim();
  const tariffRaw = input[COMMERCE_TARIFF_REF_KEY];
  const tariffReference =
    typeof tariffRaw === "string" ? tariffRaw.trim() : undefined;
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isCommerceKind(input.commerceKind)) {
    throw new Error(`Unknown commerce kind: ${String(input.commerceKind)}`);
  }

  const commerceStatus: CommerceStatus =
    input.commerceStatus ?? COMMERCE_STATUSES.Draft;
  if (!isCommerceStatus(commerceStatus)) {
    throw new Error(
      `Unknown commerce status: ${String(input.commerceStatus)}`,
    );
  }

  if (input.catalogReference !== undefined && !catalogReference) {
    throw new Error("catalogReference must not be empty when provided");
  }
  if (input.customerReference !== undefined && !customerReference) {
    throw new Error("customerReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (
    input.parentCommerceReference !== undefined &&
    !parentCommerceReference
  ) {
    throw new Error(
      "parentCommerceReference must not be empty when provided",
    );
  }
  if (tariffRaw !== undefined && !tariffReference) {
    throw new Error(
      `${COMMERCE_TARIFF_REF_KEY} must not be empty when provided`,
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("commerce does not apply to this tenant");
  }

  const providedReference = input.commerceReference?.trim() ?? "";
  if (input.commerceReference !== undefined && !providedReference) {
    throw new Error("commerceReference must not be empty when provided");
  }

  const commerceKind: CommerceKind = input.commerceKind;
  const commerceReference = providedReference || allocateCommerceReference();

  return {
    commerceReference,
    tenantReference,
    commerceKind,
    commerceStatus,
    ...(catalogReference !== undefined && catalogReference.length > 0
      ? { catalogReference }
      : {}),
    ...(customerReference !== undefined && customerReference.length > 0
      ? { customerReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(parentCommerceReference !== undefined &&
    parentCommerceReference.length > 0
      ? { parentCommerceReference }
      : {}),
    ...(tariffReference !== undefined && tariffReference.length > 0
      ? { [COMMERCE_TARIFF_REF_KEY]: tariffReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateCommerceReference(): string {
  commerceSequence += 1;
  return `commerce-${commerceSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetCommerceReferenceSequence(): void {
  commerceSequence = 0;
}
