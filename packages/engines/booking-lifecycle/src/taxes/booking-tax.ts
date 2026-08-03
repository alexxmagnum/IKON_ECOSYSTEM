/**
 * Booking Tax Boundary — fiscal decision intent (not Pricing / Payment / Billing).
 * Distinct from Pricing (price), Discount (reduction), Payment (how to charge).
 *
 * @see DEC-BOOKING-TAX-001
 * @see DEC-BOOKING-PRICING-001
 * @see DEC-BOOKING-PAYMENT-001
 */

/** Internal tax kinds — not country tax codes or legal schedules. */
export const BOOKING_TAX_KINDS = {
  ServiceTax: "booking.service_tax",
  LocalTax: "booking.local_tax",
  FeeTax: "booking.fee_tax",
  VatReference: "booking.vat_reference",
} as const;

export type BookingTaxKind =
  (typeof BOOKING_TAX_KINDS)[keyof typeof BOOKING_TAX_KINDS];

export const BOOKING_TAX_KIND_VALUES = Object.values(
  BOOKING_TAX_KINDS,
) as readonly BookingTaxKind[];

/**
 * Opaque context for a tax evaluation.
 * No tax ids, fiscal addresses, bank data, PII, or credentials.
 */
export interface BookingTaxRequest {
  /** Opaque unique tax evaluation reference. */
  taxReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Optional booking related to the evaluation. */
  bookingReference?: string;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque amount reference from Pricing/Discount pipeline — not a charge id. */
  amountReference: string;
  /** Internal tax kind. */
  taxKind: BookingTaxKind;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a Booking tax evaluation.
 * Does not compute legal tax amounts — only applicability / opaque references.
 */
export interface TaxDecision {
  taxApplicable: boolean;
  taxReference: string;
  amountReference: string;
  reason?: string;
}

/**
 * Booking Tax — answers “what fiscal impact applies to this operation?”
 */
export interface BookingTax {
  evaluate(request: BookingTaxRequest): Promise<TaxDecision>;
}

/**
 * Outbound port for future tax providers (Runtime adapters).
 * Not wired in this foundation.
 */
export interface BookingTaxPort {
  evaluateTax(request: BookingTaxRequest): Promise<TaxDecision>;
}

export interface CreateBookingTaxRequestInput {
  tenantReference: string;
  amountReference: string;
  taxKind: BookingTaxKind;
  taxReference?: string;
  bookingReference?: string;
  actorReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingTaxKind(value: string): value is BookingTaxKind {
  return (BOOKING_TAX_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingTaxRequest(
  value: unknown,
): value is BookingTaxRequest {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const bookingOk =
    candidate.bookingReference === undefined ||
    (typeof candidate.bookingReference === "string" &&
      candidate.bookingReference.length > 0);
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  return (
    typeof candidate.taxReference === "string" &&
    candidate.taxReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    bookingOk &&
    actorOk &&
    typeof candidate.amountReference === "string" &&
    candidate.amountReference.length > 0 &&
    typeof candidate.taxKind === "string" &&
    isBookingTaxKind(candidate.taxKind)
  );
}

export function isTaxDecision(value: unknown): value is TaxDecision {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.taxApplicable === "boolean" &&
    typeof candidate.taxReference === "string" &&
    typeof candidate.amountReference === "string"
  );
}

export function isBookingTax(value: unknown): value is BookingTax {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingTax).evaluate === "function"
  );
}

export function isBookingTaxPort(value: unknown): value is BookingTaxPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingTaxPort).evaluateTax === "function"
  );
}
