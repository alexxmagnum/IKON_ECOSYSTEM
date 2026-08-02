/**
 * Booking Integration Boundary — outbound ports for external capabilities.
 * Domain defines *what* is needed; Runtime/infra adapters define *how*.
 *
 * Notification / Payment request shapes live in their boundaries
 * (`../notifications`, `../payments`) — this module exposes outbound ports.
 *
 * @see DEC-BOOKING-INTEGRATION-001
 * @see DEC-BOOKING-NOTIFICATION-001
 * @see DEC-BOOKING-PAYMENT-001
 */

import type { BookingNotificationRequest } from "../notifications/booking-notification-request";
import type {
  BookingPaymentRequest,
  BookingPaymentResult,
} from "../payments/booking-payment-request";

export type { BookingNotificationRequest, BookingPaymentRequest, BookingPaymentResult };

export interface BookingNotificationPort {
  sendBookingNotification(
    request: BookingNotificationRequest,
  ): Promise<void>;
}

export interface BookingPaymentPort {
  requestPayment(
    request: BookingPaymentRequest,
  ): Promise<BookingPaymentResult>;
}

/**
 * Opaque calendar sync for a Booking window.
 * No external calendar SDK shapes or OAuth tokens.
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
