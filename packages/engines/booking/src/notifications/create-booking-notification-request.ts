import type {
  BookingNotificationKind,
  BookingNotificationRequest,
  CreateBookingNotificationRequestInput,
} from "./booking-notification-request";
import { isBookingNotificationKind } from "./booking-notification-request";

let notificationSequence = 0;

/**
 * Build a validated BookingNotificationRequest (in-memory — no delivery).
 */
export function createBookingNotificationRequest(
  input: CreateBookingNotificationRequestInput,
): BookingNotificationRequest {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim() ?? "";
  const recipientReference = input.recipientReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!bookingReference) {
    throw new Error("bookingReference is required");
  }
  if (!recipientReference) {
    throw new Error("recipientReference is required");
  }
  if (!isBookingNotificationKind(input.notificationKind)) {
    throw new Error(
      `Unknown booking notification kind: ${String(input.notificationKind)}`,
    );
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }

  const notificationKind: BookingNotificationKind = input.notificationKind;
  const notificationReference =
    input.notificationReference?.trim() || allocateNotificationReference();

  return {
    notificationReference,
    tenantReference,
    bookingReference,
    recipientReference,
    notificationKind,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateNotificationReference(): string {
  notificationSequence += 1;
  return `notification-${notificationSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingNotificationReferenceSequence(): void {
  notificationSequence = 0;
}
