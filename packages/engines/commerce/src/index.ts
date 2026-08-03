/**
 * @motanos/commerce — Commerce Engine Boundary foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/commerce
 *
 * Commerce = commercial-operation existence for a business context.
 * Must not depend on collect packages, tariff packages, fiscal packages,
 * cart packages, compute vendors, or persistence vendors.
 *
 * @see DEC-COMMERCE-BOUNDARY-001
 */

export const COMMERCE_ENGINE = "@motanos/commerce" as const;

export type {
  Commerce,
  CommerceKind,
  CommercePort,
  CommerceStatus,
  CreateCommerceInput,
  CreateCommerceOptions,
} from "./commerce";
export {
  COMMERCE_KINDS,
  COMMERCE_KIND_VALUES,
  COMMERCE_STATUSES,
  COMMERCE_STATUS_VALUES,
  COMMERCE_TARIFF_REF_KEY,
  createCommerce,
  isCommerce,
  isCommerceKind,
  isCommercePort,
  isCommerceStatus,
  resetCommerceReferenceSequence,
} from "./commerce";
