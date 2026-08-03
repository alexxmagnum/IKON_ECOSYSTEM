import type {
  CreatePricingInput,
  Pricing,
  PricingKind,
  PricingStatus,
} from "./pricing";
import {
  PRICING_ITEM_REF_KEY,
  PRICING_STATUSES,
  PRICING_UNIT_REF_KEY,
  isPricingKind,
  isPricingStatus,
} from "./pricing";

let pricingSequence = 0;

export interface CreatePricingOptions {
  /**
   * When set, pricing may only be created for this tenant
   * (cross-tenant scope lock).
   */
  tenantReference?: string;
}

/**
 * Build a checked Pricing (in-memory — economic-value definition only).
 * Does not open vendor sessions or run collect / fiscal / convert flows.
 */
export function createPricing(
  input: CreatePricingInput,
  options: CreatePricingOptions = {},
): Pricing {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const contextReference = input.contextReference?.trim();
  const amountReference = input.amountReference?.trim();
  const nameReference = input.nameReference?.trim();
  const descriptionReference = input.descriptionReference?.trim();
  const parentPricingReference = input.parentPricingReference?.trim();
  const itemRaw = input[PRICING_ITEM_REF_KEY];
  const itemReference =
    typeof itemRaw === "string" ? itemRaw.trim() : undefined;
  const unitRaw = input[PRICING_UNIT_REF_KEY];
  const unitReference =
    typeof unitRaw === "string" ? unitRaw.trim() : undefined;
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isPricingKind(input.pricingKind)) {
    throw new Error(`Unknown pricing kind: ${String(input.pricingKind)}`);
  }

  const pricingStatus: PricingStatus =
    input.pricingStatus ?? PRICING_STATUSES.Draft;
  if (!isPricingStatus(pricingStatus)) {
    throw new Error(
      `Unknown pricing status: ${String(input.pricingStatus)}`,
    );
  }

  if (input.contextReference !== undefined && !contextReference) {
    throw new Error("contextReference must not be empty when provided");
  }
  if (input.amountReference !== undefined && !amountReference) {
    throw new Error("amountReference must not be empty when provided");
  }
  if (input.nameReference !== undefined && !nameReference) {
    throw new Error("nameReference must not be empty when provided");
  }
  if (input.descriptionReference !== undefined && !descriptionReference) {
    throw new Error("descriptionReference must not be empty when provided");
  }
  if (
    input.parentPricingReference !== undefined &&
    !parentPricingReference
  ) {
    throw new Error(
      "parentPricingReference must not be empty when provided",
    );
  }
  if (itemRaw !== undefined && !itemReference) {
    throw new Error(
      `${PRICING_ITEM_REF_KEY} must not be empty when provided`,
    );
  }
  if (unitRaw !== undefined && !unitReference) {
    throw new Error(
      `${PRICING_UNIT_REF_KEY} must not be empty when provided`,
    );
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("pricing does not apply to this tenant");
  }

  const providedReference = input.pricingReference?.trim() ?? "";
  if (input.pricingReference !== undefined && !providedReference) {
    throw new Error("pricingReference must not be empty when provided");
  }

  const pricingKind: PricingKind = input.pricingKind;
  const pricingReference = providedReference || allocatePricingReference();

  return {
    pricingReference,
    tenantReference,
    pricingKind,
    pricingStatus,
    ...(contextReference !== undefined && contextReference.length > 0
      ? { contextReference }
      : {}),
    ...(amountReference !== undefined && amountReference.length > 0
      ? { amountReference }
      : {}),
    ...(nameReference !== undefined && nameReference.length > 0
      ? { nameReference }
      : {}),
    ...(descriptionReference !== undefined && descriptionReference.length > 0
      ? { descriptionReference }
      : {}),
    ...(parentPricingReference !== undefined &&
    parentPricingReference.length > 0
      ? { parentPricingReference }
      : {}),
    ...(itemReference !== undefined && itemReference.length > 0
      ? { [PRICING_ITEM_REF_KEY]: itemReference }
      : {}),
    ...(unitReference !== undefined && unitReference.length > 0
      ? { [PRICING_UNIT_REF_KEY]: unitReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocatePricingReference(): string {
  pricingSequence += 1;
  return `pricing-${pricingSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetPricingReferenceSequence(): void {
  pricingSequence = 0;
}
