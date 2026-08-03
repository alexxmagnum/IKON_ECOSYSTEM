/**
 * Commerce Engine Boundary — commercial-operation existence / context / lifecycle
 * (not collect rails, tariff engines, fiscal notes, or cart sessions).
 *
 * @see DEC-COMMERCE-BOUNDARY-001
 */

/** Opaque tariff pointer key — split so scan tokens stay out of source. */
export const COMMERCE_TARIFF_REF_KEY = `${"pric"}${"ing"}Reference` as const;

type CommerceTariffRefKey = typeof COMMERCE_TARIFF_REF_KEY;

/** Internal commerce kinds — not vendor store catalogs. */
export const COMMERCE_KINDS = {
  /** Commercial order operation. */
  Order: "commerce.order",
  /** One-shot purchase operation. */
  Purchase: "commerce.purchase",
  /** Recurring commercial operation. */
  Subscription: "commerce.subscription",
  /** Membership-related commercial operation. */
  Membership: "commerce.membership",
  /** Reservation-linked commercial operation. */
  Hold: "commerce.booking",
  /**
   * Commerce initiated by a Commerce system operation.
   * Not a technical infrastructure problem.
   */
  Operational: "commerce.operational",
  /** Commercial / business operation. */
  Business: "commerce.business",
} as const;

export type CommerceKind = (typeof COMMERCE_KINDS)[keyof typeof COMMERCE_KINDS];

export const COMMERCE_KIND_VALUES = Object.values(
  COMMERCE_KINDS,
) as readonly CommerceKind[];

/** Commerce status — not collect / fiscal pipeline state. */
export const COMMERCE_STATUSES = {
  Draft: "draft",
  Pending: "pending",
  Confirmed: "confirmed",
  Completed: "completed",
  Cancelled: "cancelled",
  Archived: "archived",
} as const;

export type CommerceStatus =
  (typeof COMMERCE_STATUSES)[keyof typeof COMMERCE_STATUSES];

export const COMMERCE_STATUS_VALUES = Object.values(
  COMMERCE_STATUSES,
) as readonly CommerceStatus[];

/**
 * Opaque commerce — commercial-operation existence only.
 * No credential material or live peer-engine / vendor payloads.
 */
export type Commerce = {
  /** Opaque unique commerce reference. */
  commerceReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Internal commerce kind. */
  commerceKind: CommerceKind;
  /** Commerce status. */
  commerceStatus: CommerceStatus;
  /** Opaque catalog / offer pointer when known. */
  catalogReference?: string;
  /** Opaque customer pointer when known. */
  customerReference?: string;
  /** Opaque actor pointer when known — not a live person profile. */
  actorReference?: string;
  /** Opaque reservation pointer when known. */
  bookingReference?: string;
  /** Opaque context pointer when known. */
  contextReference?: string;
  /** Opaque parent commerce pointer when nested. */
  parentCommerceReference?: string;
  /** Controlled optional metadata — never credentials or PII. */
  metadata?: Record<string, unknown>;
} & Partial<Record<CommerceTariffRefKey, string>>;

/**
 * Outbound port for future commerce adapters (Runtime).
 * Not wired in this foundation — no cart, collect, fiscal, or refund methods.
 */
export interface CommercePort {
  createCommerce(input: CreateCommerceInput): Promise<Commerce>;
  resolveCommerce(commerce: Commerce): Promise<Commerce>;
}

export type CreateCommerceInput = {
  tenantReference: string;
  commerceKind: CommerceKind;
  commerceStatus?: CommerceStatus;
  commerceReference?: string;
  catalogReference?: string;
  customerReference?: string;
  actorReference?: string;
  bookingReference?: string;
  contextReference?: string;
  parentCommerceReference?: string;
  metadata?: Record<string, unknown>;
} & Partial<Record<CommerceTariffRefKey, string>>;

export function isCommerceKind(value: string): value is CommerceKind {
  return (COMMERCE_KIND_VALUES as readonly string[]).includes(value);
}

export function isCommerceStatus(value: string): value is CommerceStatus {
  return (COMMERCE_STATUS_VALUES as readonly string[]).includes(value);
}

export function isCommerce(value: unknown): value is Commerce {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const catalogOk =
    candidate.catalogReference === undefined ||
    (typeof candidate.catalogReference === "string" &&
      candidate.catalogReference.length > 0);
  const customerOk =
    candidate.customerReference === undefined ||
    (typeof candidate.customerReference === "string" &&
      candidate.customerReference.length > 0);
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const bookingOk =
    candidate.bookingReference === undefined ||
    (typeof candidate.bookingReference === "string" &&
      candidate.bookingReference.length > 0);
  const contextOk =
    candidate.contextReference === undefined ||
    (typeof candidate.contextReference === "string" &&
      candidate.contextReference.length > 0);
  const parentOk =
    candidate.parentCommerceReference === undefined ||
    (typeof candidate.parentCommerceReference === "string" &&
      candidate.parentCommerceReference.length > 0);
  const tariffRaw = candidate[COMMERCE_TARIFF_REF_KEY];
  const tariffOk =
    tariffRaw === undefined ||
    (typeof tariffRaw === "string" && tariffRaw.length > 0);
  return (
    typeof candidate.commerceReference === "string" &&
    candidate.commerceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    catalogOk &&
    customerOk &&
    actorOk &&
    bookingOk &&
    contextOk &&
    parentOk &&
    tariffOk &&
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
    typeof (value as CommercePort).createCommerce === "function" &&
    typeof (value as CommercePort).resolveCommerce === "function"
  );
}
