/**
 * Booking Pricing Boundary — economic condition / price decision (not payment).
 * Distinct from Payment (how to charge), Policy (business conditions), Authorization.
 *
 * @see DEC-BOOKING-PRICING-001
 * @see DEC-BOOKING-PAYMENT-001
 */

/** Pricing evaluation operations aligned with Booking lifecycle. */
export const BOOKING_PRICING_OPERATIONS = {
  Create: "booking.create",
  Confirm: "booking.confirm",
  Reschedule: "booking.reschedule",
  Cancel: "booking.cancel",
} as const;

export type BookingPricingOperation =
  (typeof BOOKING_PRICING_OPERATIONS)[keyof typeof BOOKING_PRICING_OPERATIONS];

export const BOOKING_PRICING_OPERATION_VALUES = Object.values(
  BOOKING_PRICING_OPERATIONS,
) as readonly BookingPricingOperation[];

/**
 * Opaque context for a pricing evaluation.
 * No cards, payment tokens, bank data, or credentials.
 */
export interface BookingPricingRequest {
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Opaque actor — required. */
  actorReference: string;
  /** Pricing operation under evaluation. */
  operation: BookingPricingOperation;
  /** Optional booking related to the evaluation. */
  bookingReference?: string;
  /** Optional resource related to the evaluation. */
  resourceReference?: string;
  /** Optional membership related to the evaluation. */
  membershipReference?: string;
  /** Controlled optional metadata — never secrets or payment credentials. */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a Booking pricing evaluation.
 * `amountReference` is a pricing value reference — not a Payment intent.
 */
export interface PricingDecision {
  allowed: boolean;
  /** Opaque pricing amount reference (not a gateway charge id). */
  amountReference: string;
  /** ISO-like currency code for the pricing decision (not a ledger entry). */
  currency: string;
  reason?: string;
  pricingReference?: string;
}

/**
 * Booking Pricing — answers “what price / economic condition applies?”
 */
export interface BookingPricing {
  evaluate(request: BookingPricingRequest): Promise<PricingDecision>;
}

export function isBookingPricingOperation(
  value: string,
): value is BookingPricingOperation {
  return (BOOKING_PRICING_OPERATION_VALUES as readonly string[]).includes(
    value,
  );
}

export function isPricingDecision(value: unknown): value is PricingDecision {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.allowed === "boolean" &&
    typeof candidate.amountReference === "string" &&
    typeof candidate.currency === "string"
  );
}

export function isBookingPricing(value: unknown): value is BookingPricing {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingPricing).evaluate === "function"
  );
}
