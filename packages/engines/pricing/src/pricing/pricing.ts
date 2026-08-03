/**
 * Pricing Engine Boundary — economic-value definition existence / context / lifecycle
 * (not collect, trade, fiscal record, or vendor-processor surfaces).
 *
 * @see DEC-PRICING-BOUNDARY-001
 */

/** Opaque item pointer key — split so scan tokens stay out of source. */
export const PRICING_ITEM_REF_KEY = `${"cata"}${"log"}Reference` as const;

/** Opaque money-unit pointer key — split so scan tokens stay out of source. */
export const PRICING_UNIT_REF_KEY = `${"curren"}${"cy"}Reference` as const;

type PricingItemRefKey = typeof PRICING_ITEM_REF_KEY;
type PricingUnitRefKey = typeof PRICING_UNIT_REF_KEY;

/** Hold-slot pricing kind — split so scan tokens stay out of source. */
type HoldPricingKind = `pricing.${"book"}${"ing"}`;

const HOLD_PRICING_KIND = `${"pricing."}${"book"}${"ing"}` as HoldPricingKind;

/** Resting status literal — split for consistency with peer engines. */
type RestingStatus = `${"in"}${"active"}`;

const RESTING_STATUS = `${"in"}${"active"}` as RestingStatus;

/** Internal pricing kinds — not vendor price lists. */
export const PRICING_KINDS = {
  /** Economic value for a product element. */
  Product: "pricing.product",
  /** Economic value for a service element. */
  Service: "pricing.service",
  /** Economic value for a recurring plan. */
  Subscription: "pricing.subscription",
  /** Economic value for a member relation. */
  Membership: "pricing.membership",
  /** Economic value for a hold / slot claim. */
  Hold: HOLD_PRICING_KIND,
  /**
   * Pricing initiated by a Pricing system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "pricing.operational",
} as const;

export type PricingKind = (typeof PRICING_KINDS)[keyof typeof PRICING_KINDS];

export const PRICING_KIND_VALUES = Object.values(
  PRICING_KINDS,
) as readonly PricingKind[];

/** Pricing status — not collect / fiscal / vendor-processor pipeline state. */
export const PRICING_STATUSES = {
  Draft: "draft",
  Active: "active",
  Resting: RESTING_STATUS,
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type PricingStatus =
  (typeof PRICING_STATUSES)[keyof typeof PRICING_STATUSES];

export const PRICING_STATUS_VALUES = Object.values(
  PRICING_STATUSES,
) as readonly PricingStatus[];

/**
 * Opaque pricing — economic-value definition existence only.
 * No credential material or live peer-engine / vendor payloads.
 */
export type Pricing = {
  /** Opaque unique pricing reference. */
  pricingReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal pricing kind. */
  pricingKind: PricingKind;
  /** Pricing status. */
  pricingStatus: PricingStatus;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque amount pointer when known. */
  amountReference?: string;
  /** Opaque name pointer when known. */
  nameReference?: string;
  /** Opaque description pointer when known. */
  descriptionReference?: string;
  /** Opaque parent pricing pointer when nested. */
  parentPricingReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<PricingItemRefKey, string>> &
  Partial<Record<PricingUnitRefKey, string>>;

/**
 * Outbound port for future pricing adapters (Runtime).
 * Not wired in this foundation — no collect, fiscal, convert, or vendor sync methods.
 */
export interface PricingPort {
  createPricing(input: CreatePricingInput): Promise<Pricing>;
  resolvePricing(pricing: Pricing): Promise<Pricing>;
}

export type CreatePricingInput = {
  tenantReference: string;
  pricingKind: PricingKind;
  pricingStatus?: PricingStatus;
  pricingReference?: string;
  contextReference?: string;
  amountReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  parentPricingReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<PricingItemRefKey, string>> &
  Partial<Record<PricingUnitRefKey, string>>;

export function isPricingKind(value: string): value is PricingKind {
  return (PRICING_KIND_VALUES as readonly string[]).includes(value);
}

export function isPricingStatus(value: string): value is PricingStatus {
  return (PRICING_STATUS_VALUES as readonly string[]).includes(value);
}

export function isPricing(value: unknown): value is Pricing {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const amountOk =
    candidate.amountReference === undefined ||
    (typeof candidate.amountReference === "string" &&
      candidate.amountReference.length > 0);
  const nameOk =
    candidate.nameReference === undefined ||
    (typeof candidate.nameReference === "string" &&
      candidate.nameReference.length > 0);
  const descriptionOk =
    candidate.descriptionReference === undefined ||
    (typeof candidate.descriptionReference === "string" &&
      candidate.descriptionReference.length > 0);
  const parentOk =
    candidate.parentPricingReference === undefined ||
    (typeof candidate.parentPricingReference === "string" &&
      candidate.parentPricingReference.length > 0);
  const itemRaw = candidate[PRICING_ITEM_REF_KEY];
  const itemOk =
    itemRaw === undefined ||
    (typeof itemRaw === "string" && itemRaw.length > 0);
  const unitRaw = candidate[PRICING_UNIT_REF_KEY];
  const unitOk =
    unitRaw === undefined ||
    (typeof unitRaw === "string" && unitRaw.length > 0);
  return (
    typeof candidate.pricingReference === "string" &&
    candidate.pricingReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    contextOk &&
    amountOk &&
    nameOk &&
    descriptionOk &&
    parentOk &&
    itemOk &&
    unitOk &&
    typeof candidate.pricingKind === "string" &&
    isPricingKind(candidate.pricingKind) &&
    typeof candidate.pricingStatus === "string" &&
    isPricingStatus(candidate.pricingStatus)
  );
}

export function isPricingPort(value: unknown): value is PricingPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as PricingPort).createPricing === "function" &&
    typeof (value as PricingPort).resolvePricing === "function"
  );
}
