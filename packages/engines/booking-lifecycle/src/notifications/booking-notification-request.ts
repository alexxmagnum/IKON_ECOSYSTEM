/**
 * Booking Notification Boundary — communication intent (not a provider).
 * Domain Events are facts; Notification Requests are outbound communication asks.
 *
 * @see DEC-BOOKING-NOTIFICATION-001
 */

/** Internal notification kinds — not channels (email / WhatsApp / push / SMS). */
export const BOOKING_NOTIFICATION_KINDS = {
  BookingConfirmed: "booking.confirmed",
  BookingCancelled: "booking.cancelled",
  BookingReminder: "booking.reminder",
  BookingPaymentRequired: "booking.payment_required",
} as const;

export type BookingNotificationKind =
  (typeof BOOKING_NOTIFICATION_KINDS)[keyof typeof BOOKING_NOTIFICATION_KINDS];

export const BOOKING_NOTIFICATION_KIND_VALUES = Object.values(
  BOOKING_NOTIFICATION_KINDS,
) as readonly BookingNotificationKind[];

/**
 * Opaque request to communicate about a Booking fact.
 * No emails, phone numbers, message bodies, templates, tokens, or credentials.
 */
export interface BookingNotificationRequest {
  /** Opaque unique notification reference. */
  notificationReference: string;
  /** Explicit tenant scope. */
  tenantReference: string;
  /** Opaque booking related to this communication. */
  bookingReference: string;
  /** Opaque recipient — never an email address or phone number. */
  recipientReference: string;
  /** Opaque actor that triggered the intent, when known. */
  actorReference?: string;
  /** Internal communication kind. */
  notificationKind: BookingNotificationKind;
  /** Controlled optional metadata — never secrets or message content. */
  metadata?: Record<string, unknown>;
}

export interface CreateBookingNotificationRequestInput {
  tenantReference: string;
  bookingReference: string;
  recipientReference: string;
  notificationKind: BookingNotificationKind;
  actorReference?: string;
  notificationReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingNotificationKind(
  value: string,
): value is BookingNotificationKind {
  return (BOOKING_NOTIFICATION_KIND_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingNotificationRequest(
  value: unknown,
): value is BookingNotificationRequest {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  return (
    typeof candidate.notificationReference === "string" &&
    candidate.notificationReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    typeof candidate.recipientReference === "string" &&
    candidate.recipientReference.length > 0 &&
    actorOk &&
    typeof candidate.notificationKind === "string" &&
    isBookingNotificationKind(candidate.notificationKind)
  );
}
