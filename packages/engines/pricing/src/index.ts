/**
 * @motanos/pricing — Pricing Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/pricing
 *
 * Pricing = economic-value definition for a context or business element.
 * Must not depend on item packages, trade packages, collect packages,
 * money-unit packages, fiscal packages, hold packages, info packages,
 * media packages, structure packages, offer packages, signal packages,
 * actor packages, relation packages, compute vendors, or persistence vendors.
 *
 * @see DEC-PRICING-BOUNDARY-001
 */

export const PRICING_ENGINE = "@motanos/pricing" as const;

export type {
  CreatePricingInput,
  CreatePricingOptions,
  Pricing,
  PricingKind,
  PricingPort,
  PricingStatus,
} from "./pricing";
export {
  PRICING_ITEM_REF_KEY,
  PRICING_KINDS,
  PRICING_KIND_VALUES,
  PRICING_STATUSES,
  PRICING_STATUS_VALUES,
  PRICING_UNIT_REF_KEY,
  createPricing,
  isPricing,
  isPricingKind,
  isPricingPort,
  isPricingStatus,
  resetPricingReferenceSequence,
} from "./pricing";
