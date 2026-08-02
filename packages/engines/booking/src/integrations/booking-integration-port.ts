/**
 * Booking Integration Boundary — outbound ports for external capabilities.
 * Domain defines *what* is needed; Runtime/infra adapters define *how*.
 *
 * @see DEC-BOOKING-INTEGRATION-001
 */

/** Internal notification intent — not an email/WhatsApp/push channel. */
export const BOOKING_NOTIFICATION_KINDS = {
  BookingCreated: "booking.created",
  BookingConfirmed: "booking.confirmed",
  BookingCancelled: "booking.cancelled",
  BookingRescheduled: "booking.rescheduled",
  BookingExpired: "booking.expired",
} as const;

export type BookingNotificationKind =
  (typeof BOOKING_NOTIFICATION_KINDS)[keyof typeof BOOKING_NOTIFICATION_KINDS];

/**
 * Opaque request to notify about a Booking fact.
 * No addresses, phone numbers, API keys, or provider payloads.
 */
export interface BookingNotificationRequest {
  tenantReference: string;
  bookingReference: string;
  recipientReference: string;
  notificationKind: BookingNotificationKind;
  /** Controlled optional metadata — never secrets or credentials. */
  metadata?: Record<string, unknown>;
}

export interface BookingNotificationPort {
  sendBookingNotification(
    request: BookingNotificationRequest,
  ): Promise<void>;
}

/**
 * Opaque payment intent for a Booking.
 * No Stripe/PayPal payloads, tokens, or card data.
 */
export interface BookingPaymentRequest {
  tenantReference: string;
  bookingReference: string;
  payerReference: string;
  /** Opaque amount token resolved outside the Booking domain. */
  amountReference: string;
  metadata?: Record<string, unknown>;
}

export interface BookingPaymentResult {
  /** Opaque payment reference from the integration side. */
  paymentReference: string;
}

export interface BookingPaymentPort {
  requestPayment(
    request: BookingPaymentRequest,
  ): Promise<BookingPaymentResult>;
}

/**
 * Opaque calendar sync for a Booking window.
 * No Google/Outlook SDK shapes or OAuth tokens.
 */
export interface BookingCalendarSyncRequest {
  tenantReference: string;
  bookingReference: string;
  resourceReference: string;
  startAt: string;
  endAt: string;
  metadata?: Record<string, unknown>;
}

export interface BookingCalendarPort {
  syncBookingCalendar(request: BookingCalendarSyncRequest): Promise<void>;
}

/**
 * Aggregate Integration Port for Booking outbound capabilities.
 * Adapters implementing this live in Runtime / future infrastructure — not in domain services.
 */
export interface BookingIntegrationPort {
  notifications: BookingNotificationPort;
  payments: BookingPaymentPort;
  calendar: BookingCalendarPort;
}

export function isBookingNotificationPort(
  value: unknown,
): value is BookingNotificationPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingNotificationPort).sendBookingNotification ===
      "function"
  );
}

export function isBookingPaymentPort(
  value: unknown,
): value is BookingPaymentPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingPaymentPort).requestPayment === "function"
  );
}

export function isBookingCalendarPort(
  value: unknown,
): value is BookingCalendarPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingCalendarPort).syncBookingCalendar === "function"
  );
}

export function isBookingIntegrationPort(
  value: unknown,
): value is BookingIntegrationPort {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as BookingIntegrationPort;
  return (
    isBookingNotificationPort(candidate.notifications) &&
    isBookingPaymentPort(candidate.payments) &&
    isBookingCalendarPort(candidate.calendar)
  );
}

/** Field names that must never appear on integration request contracts. */
export const BOOKING_INTEGRATION_FORBIDDEN_REQUEST_KEYS = [
  "api_key",
  "password",
  "token",
  "secret",
  "credential",
  "credentials",
  "authorization",
] as const;
