import type {
  BookingPaymentKind,
  BookingPaymentRequest,
  CreateBookingPaymentRequestInput,
} from "./booking-payment-request";
import { isBookingPaymentKind } from "./booking-payment-request";

let paymentSequence = 0;

/**
 * Build a validated BookingPaymentRequest (in-memory — no charge / gateway).
 */
export function createBookingPaymentRequest(
  input: CreateBookingPaymentRequestInput,
): BookingPaymentRequest {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim() ?? "";
  const payerReference = input.payerReference?.trim() ?? "";
  const amountReference = input.amountReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!bookingReference) {
    throw new Error("bookingReference is required");
  }
  if (!payerReference) {
    throw new Error("payerReference is required");
  }
  if (!amountReference) {
    throw new Error("amountReference is required");
  }
  if (!isBookingPaymentKind(input.paymentKind)) {
    throw new Error(
      `Unknown booking payment kind: ${String(input.paymentKind)}`,
    );
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }

  const paymentKind: BookingPaymentKind = input.paymentKind;
  const paymentReference =
    input.paymentReference?.trim() || allocatePaymentReference();

  return {
    paymentReference,
    tenantReference,
    bookingReference,
    payerReference,
    paymentKind,
    amountReference,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocatePaymentReference(): string {
  paymentSequence += 1;
  return `payment-${paymentSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingPaymentReferenceSequence(): void {
  paymentSequence = 0;
}
