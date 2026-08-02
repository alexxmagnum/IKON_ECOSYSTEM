/**
 * Booking Payment Boundary — payment intent (not a provider).
 * Domain knows a booking may need payment; this contract represents that intent.
 *
 * @see DEC-BOOKING-PAYMENT-001
 */

/** Internal payment kinds — not gateway operations or vendor charge types. */
export const BOOKING_PAYMENT_KINDS = {
  BookingDeposit: "booking.deposit",
  BookingFullPayment: "booking.full_payment",
  BookingPaymentRequired: "booking.payment_required",
  BookingRefund: "booking.refund",
} as const;

export type BookingPaymentKind =
  (typeof BOOKING_PAYMENT_KINDS)[keyof typeof BOOKING_PAYMENT_KINDS];

export const BOOKING_PAYMENT_KIND_VALUES = Object.values(
  BOOKING_PAYMENT_KINDS,
) as readonly BookingPaymentKind[];

/**
 * Opaque request representing a Booking payment intent.
 * No card numbers, payment tokens, credentials, or vendor payloads.
 */
export interface BookingPaymentRequest {
  /** Opaque unique payment reference. */
  paymentReference: string;
  /** Explicit tenant scope. */
  tenantReference: string;
  /** Opaque booking related to this payment intent. */
  bookingReference: string;
  /** Opaque payer — never account numbers or wallet ids from vendors. */
  payerReference: string;
  /** Opaque actor that triggered the intent, when known. */
  actorReference?: string;
  /** Internal payment kind. */
  paymentKind: BookingPaymentKind;
  /** Opaque amount context resolved outside Booking domain finance models. */
  amountReference: string;
  /** Controlled optional metadata — never secrets or card data. */
  metadata?: Record<string, unknown>;
}

/**
 * Opaque acknowledgment returned by a future payment adapter.
 * Not a ledger entry or invoice.
 */
export interface BookingPaymentResult {
  paymentReference: string;
}

export interface CreateBookingPaymentRequestInput {
  tenantReference: string;
  bookingReference: string;
  payerReference: string;
  paymentKind: BookingPaymentKind;
  amountReference: string;
  actorReference?: string;
  paymentReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingPaymentKind(
  value: string,
): value is BookingPaymentKind {
  return (BOOKING_PAYMENT_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingPaymentRequest(
  value: unknown,
): value is BookingPaymentRequest {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  return (
    typeof candidate.paymentReference === "string" &&
    candidate.paymentReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    typeof candidate.payerReference === "string" &&
    candidate.payerReference.length > 0 &&
    actorOk &&
    typeof candidate.paymentKind === "string" &&
    isBookingPaymentKind(candidate.paymentKind) &&
    typeof candidate.amountReference === "string" &&
    candidate.amountReference.length > 0
  );
}
