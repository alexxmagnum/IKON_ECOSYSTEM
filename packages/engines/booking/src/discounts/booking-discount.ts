/**
 * Booking Discount Boundary — economic reduction reference (not Pricing / Payment).
 * Distinct from Pricing (what price), Payment (how to charge), Policy (conditions).
 *
 * @see DEC-BOOKING-DISCOUNT-001
 * @see DEC-BOOKING-PRICING-001
 * @see DEC-BOOKING-PAYMENT-001
 */

/** Discount evaluation operations aligned with Booking lifecycle. */
export const BOOKING_DISCOUNT_OPERATIONS = {
  Create: "booking.create",
  Confirm: "booking.confirm",
  Reschedule: "booking.reschedule",
  Cancel: "booking.cancel",
} as const;

export type BookingDiscountOperation =
  (typeof BOOKING_DISCOUNT_OPERATIONS)[keyof typeof BOOKING_DISCOUNT_OPERATIONS];

export const BOOKING_DISCOUNT_OPERATION_VALUES = Object.values(
  BOOKING_DISCOUNT_OPERATIONS,
) as readonly BookingDiscountOperation[];

/**
 * Opaque context for a discount evaluation.
 * No cards, payment tokens, bank data, private promo secrets, or PII.
 */
export interface BookingDiscountRequest {
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Opaque actor — required. */
  actorReference: string;
  /** Discount operation under evaluation. */
  operation: BookingDiscountOperation;
  /** Optional booking related to the evaluation. */
  bookingReference?: string;
  /** Optional membership related to the evaluation. */
  membershipReference?: string;
  /** Optional resource related to the evaluation. */
  resourceReference?: string;
  /** Optional pricing decision reference from Pricing Boundary. */
  pricingReference?: string;
  /** Controlled optional metadata — never secrets or credentials. */
  metadata?: Record<string, unknown>;
}

/**
 * Result of a Booking discount evaluation.
 * Economic fields are opaque domain references — not gateway or billing ids.
 */
export interface DiscountDecision {
  /** Whether a reduction applies. */
  applied: boolean;
  /** Opaque discount identity when applied (or denied with reference). */
  discountReference?: string;
  /** Opaque reduction amount reference — not a Payment capture amount. */
  discountAmountReference?: string;
  reason?: string;
}

/**
 * Booking Discount — answers “does a reduction apply, and under which reference?”
 */
export interface BookingDiscount {
  evaluate(request: BookingDiscountRequest): Promise<DiscountDecision>;
}

export function isBookingDiscountOperation(
  value: string,
): value is BookingDiscountOperation {
  return (BOOKING_DISCOUNT_OPERATION_VALUES as readonly string[]).includes(
    value,
  );
}

export function isDiscountDecision(value: unknown): value is DiscountDecision {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return typeof candidate.applied === "boolean";
}

export function isBookingDiscount(value: unknown): value is BookingDiscount {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingDiscount).evaluate === "function"
  );
}
