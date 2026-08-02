/**
 * Booking Fee Boundary — additional charge intent (not Pricing / Tax / Payment).
 * Distinct from Pricing (base price), Discount (reduction), Tax (fiscal impact), Payment (capture).
 *
 * @see DEC-BOOKING-FEE-001
 * @see DEC-BOOKING-PRICING-001
 * @see DEC-BOOKING-TAX-001
 * @see DEC-BOOKING-PAYMENT-001
 */

/** Internal fee kinds — not commercial commission schedules or billing line items. */
export const BOOKING_FEE_KINDS = {
  ServiceFee: "booking.service_fee",
  PlatformFee: "booking.platform_fee",
  BookingFee: "booking.booking_fee",
  ConvenienceFee: "booking.convenience_fee",
} as const;

export type BookingFeeKind =
  (typeof BOOKING_FEE_KINDS)[keyof typeof BOOKING_FEE_KINDS];

export const BOOKING_FEE_KIND_VALUES = Object.values(
  BOOKING_FEE_KINDS,
) as readonly BookingFeeKind[];

/**
 * Opaque context for a fee evaluation.
 * No cards, invoices, bank data, PII, or credentials.
 */
export interface BookingFeeRequest {
  /** Opaque unique fee evaluation reference. */
  feeReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Optional booking related to the evaluation. */
  bookingReference?: string;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque amount reference from Pricing pipeline — not a charge id. */
  amountReference: string;
  /** Internal fee kind. */
  feeKind: BookingFeeKind;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a Booking fee evaluation.
 * Does not compute commercial fee math — only applicability / opaque references.
 */
export interface FeeDecision {
  feeApplicable: boolean;
  feeReference: string;
  amountReference: string;
  reason?: string;
}

/**
 * Booking Fee — answers “is there an additional charge for this operation?”
 */
export interface BookingFee {
  evaluate(request: BookingFeeRequest): Promise<FeeDecision>;
}

/**
 * Outbound port for future fee providers (Runtime adapters).
 * Not wired in this foundation.
 */
export interface BookingFeePort {
  evaluateFee(request: BookingFeeRequest): Promise<FeeDecision>;
}

export interface CreateBookingFeeRequestInput {
  tenantReference: string;
  amountReference: string;
  feeKind: BookingFeeKind;
  feeReference?: string;
  bookingReference?: string;
  actorReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingFeeKind(value: string): value is BookingFeeKind {
  return (BOOKING_FEE_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingFeeRequest(
  value: unknown,
): value is BookingFeeRequest {
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
    typeof candidate.feeReference === "string" &&
    candidate.feeReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    bookingOk &&
    actorOk &&
    typeof candidate.amountReference === "string" &&
    candidate.amountReference.length > 0 &&
    typeof candidate.feeKind === "string" &&
    isBookingFeeKind(candidate.feeKind)
  );
}

export function isFeeDecision(value: unknown): value is FeeDecision {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.feeApplicable === "boolean" &&
    typeof candidate.feeReference === "string" &&
    typeof candidate.amountReference === "string"
  );
}

export function isBookingFee(value: unknown): value is BookingFee {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingFee).evaluate === "function"
  );
}

export function isBookingFeePort(value: unknown): value is BookingFeePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingFeePort).evaluateFee === "function"
  );
}
