import type {
  CommerceKind,
  CommerceOffer,
  CommerceStatus,
  CreateCommerceOfferInput,
} from "./commerce-offer";
import {
  COMMERCE_STATUSES,
  isCommerceKind,
  isCommerceStatus,
} from "./commerce-offer";

let commerceSequence = 0;

export interface CreateCommerceOfferOptions {
  /**
   * When set, commerce offer may only be created for this tenant
   * (cross-tenant isolation).
   */
  tenantReference?: string;
}

/**
 * Build a validated CommerceOffer (in-memory — commercial context only).
 * Does not charge, refund, issue fiscal docs, or open cart sessions.
 */
export function createCommerceOffer(
  input: CreateCommerceOfferInput,
  options: CreateCommerceOfferOptions = {},
): CommerceOffer {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const experienceReference = input.experienceReference?.trim();
  const membershipReference = input.membershipReference?.trim();
  const bookingReference = input.bookingReference?.trim();
  const priceReference = input.priceReference?.trim();
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

  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (input.experienceReference !== undefined && !experienceReference) {
    throw new Error("experienceReference must not be empty when provided");
  }
  if (input.membershipReference !== undefined && !membershipReference) {
    throw new Error("membershipReference must not be empty when provided");
  }
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.priceReference !== undefined && !priceReference) {
    throw new Error("priceReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("commerce offer does not apply to this tenant");
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
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(experienceReference !== undefined && experienceReference.length > 0
      ? { experienceReference }
      : {}),
    ...(membershipReference !== undefined && membershipReference.length > 0
      ? { membershipReference }
      : {}),
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(priceReference !== undefined && priceReference.length > 0
      ? { priceReference }
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
