/**
 * @motanos/commerce — Commerce Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/commerce
 *
 * Commerce = what can be acquired and at what referenced value.
 * Experience / Membership / Booking define context; charge rails and
 * fiscal documents live elsewhere.
 *
 * Must not depend on usage engines, experience engines, membership engines,
 * charge-rail packages, fiscal packages, auth packages, or persistence vendors.
 *
 * @see DEC-COMMERCE-BOUNDARY-001
 */

export const COMMERCE_ENGINE = "@motanos/commerce" as const;

export type {
  CommerceKind,
  CommerceOffer,
  CommercePort,
  CommerceStatus,
  CreateCommerceOfferInput,
  CreateCommerceOfferOptions,
} from "./commerce";
export {
  COMMERCE_KINDS,
  COMMERCE_KIND_VALUES,
  COMMERCE_STATUSES,
  COMMERCE_STATUS_VALUES,
  createCommerceOffer,
  isCommerceKind,
  isCommerceOffer,
  isCommercePort,
  isCommerceStatus,
  resetCommerceReferenceSequence,
} from "./commerce";
