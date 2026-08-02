/**
 * Commerce Engine Boundary — commercial offer / acquire context
 * (not charge rails, fiscal documents, plans, or bank connectors).
 *
 * @see DEC-COMMERCE-BOUNDARY-001
 * @see DEC-EXPERIENCE-BOUNDARY-001
 */

/** Internal commerce kinds — not SKUs from external stores. */
export const COMMERCE_KINDS = {
  /** Commercial offer (e.g. tournament entry). */
  Offer: "commerce.offer",
  /** Sellable product. */
  Product: "commerce.product",
  /** Sellable service. */
  Service: "commerce.service",
  /** Event / activity registration. */
  Registration: "commerce.registration",
  /** Membership-related commercial offer. */
  Membership: "commerce.membership",
  /**
   * Commerce initiated by a Commerce system operation.
   * Not a technical infrastructure error.
   */
  Operational: "commerce.operational",
} as const;

export type CommerceKind =
  (typeof COMMERCE_KINDS)[keyof typeof COMMERCE_KINDS];

export const COMMERCE_KIND_VALUES = Object.values(
  COMMERCE_KINDS,
) as readonly CommerceKind[];

/** Commerce offer status — not charge or fiscal document state. */
export const COMMERCE_STATUSES = {
  Draft: "draft",
  Active: "active",
  Paused: "paused",
  Expired: "expired",
  Archived: "archived",
  Cancelled: "cancelled",
} as const;

export type CommerceStatus =
  (typeof COMMERCE_STATUSES)[keyof typeof COMMERCE_STATUSES];

export const COMMERCE_STATUS_VALUES = Object.values(
  COMMERCE_STATUSES,
) as readonly CommerceStatus[];

/**
 * Opaque commercial offer — what can be acquired and at what referenced value.
 * No card data, secrets, or charge-rail fields.
 */
export interface CommerceOffer {
  /** Opaque unique commerce reference. */
  commerceReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal commerce kind. */
  commerceKind: CommerceKind;
  /** Commerce offer status. */
  commerceStatus: CommerceStatus;
  /** Opaque display-name pointer — not live localized copy. */
  nameReference?: string;
  /** Opaque description pointer — not live localized copy. */
  descriptionReference?: string;
  /** Opaque experience pointer — not a live offering graph. */
  experienceReference?: string;
  /** Opaque membership pointer — not a live membership graph. */
  membershipReference?: string;
  /** Opaque booking pointer — not a live reservation graph. */
  bookingReference?: string;
  /** Opaque price pointer — not a live money calculation. */
  priceReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future commerce adapters (Runtime).
 * Not wired in this foundation — no charge, refund, or fiscal flows.
 */
export interface CommercePort {
  createCommerceOffer(input: CreateCommerceOfferInput): Promise<CommerceOffer>;
  resolveCommerceOffer(offer: CommerceOffer): Promise<CommerceOffer>;
}

export interface CreateCommerceOfferInput {
  tenantReference: string;
  commerceKind: CommerceKind;
  commerceStatus?: CommerceStatus;
  commerceReference?: string;
  nameReference?: string;
  descriptionReference?: string;
  experienceReference?: string;
  membershipReference?: string;
  bookingReference?: string;
  priceReference?: string;
  metadata?: Record<string, unknown>;
}

export function isCommerceKind(value: string): value is CommerceKind {
  return (COMMERCE_KIND_VALUES as readonly string[]).includes(value);
}

export function isCommerceStatus(value: string): value is CommerceStatus {
  return (COMMERCE_STATUS_VALUES as readonly string[]).includes(value);
}

export function isCommerceOffer(value: unknown): value is CommerceOffer {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const nameOk =
    candidate.nameReference === undefined ||
    (typeof candidate.nameReference === "string" &&
      candidate.nameReference.length > 0);
  const descriptionOk =
    candidate.descriptionReference === undefined ||
    (typeof candidate.descriptionReference === "string" &&
      candidate.descriptionReference.length > 0);
  const experienceOk =
    candidate.experienceReference === undefined ||
    (typeof candidate.experienceReference === "string" &&
      candidate.experienceReference.length > 0);
  const membershipOk =
    candidate.membershipReference === undefined ||
    (typeof candidate.membershipReference === "string" &&
      candidate.membershipReference.length > 0);
  const bookingOk =
    candidate.bookingReference === undefined ||
    (typeof candidate.bookingReference === "string" &&
      candidate.bookingReference.length > 0);
  const priceOk =
    candidate.priceReference === undefined ||
    (typeof candidate.priceReference === "string" &&
      candidate.priceReference.length > 0);
  return (
    typeof candidate.commerceReference === "string" &&
    candidate.commerceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    nameOk &&
    descriptionOk &&
    experienceOk &&
    membershipOk &&
    bookingOk &&
    priceOk &&
    typeof candidate.commerceKind === "string" &&
    isCommerceKind(candidate.commerceKind) &&
    typeof candidate.commerceStatus === "string" &&
    isCommerceStatus(candidate.commerceStatus)
  );
}

export function isCommercePort(value: unknown): value is CommercePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as CommercePort).createCommerceOffer === "function" &&
    typeof (value as CommercePort).resolveCommerceOffer === "function"
  );
}
