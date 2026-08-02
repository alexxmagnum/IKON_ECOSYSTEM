import type { Booking } from "../domain/booking";
import {
  createBookingCancelledEvent,
  createBookingConfirmedEvent,
  createBookingCreatedEvent,
  createBookingHoldExpiredEvent,
  createBookingRescheduledEvent,
  type BookingCancelledEvent,
  type BookingConfirmedEvent,
  type BookingCreatedEvent,
  type BookingHoldExpiredEvent,
  type BookingRescheduledEvent,
} from "./booking-events";

/**
 * Engine-owned emission helpers — map aggregates to domain events.
 * Adapters call these after successful mutations (no bus).
 */

export function emitBookingCreated(
  booking: Booking,
  occurredAt: string = new Date().toISOString(),
): BookingCreatedEvent {
  return createBookingCreatedEvent({
    bookingReference: booking.id,
    resourceReference: booking.resourceId,
    customerReference: booking.ownerUserId,
    tenantReference: booking.tenantReference,
    occurredAt,
  });
}

export function emitBookingConfirmed(
  booking: Booking,
  occurredAt: string = new Date().toISOString(),
): BookingConfirmedEvent {
  return createBookingConfirmedEvent({
    bookingReference: booking.id,
    tenantReference: booking.tenantReference,
    occurredAt,
  });
}

export function emitBookingCancelled(
  booking: Booking,
  occurredAt: string = new Date().toISOString(),
  metadata?: Record<string, unknown>,
): BookingCancelledEvent {
  return createBookingCancelledEvent({
    bookingReference: booking.id,
    tenantReference: booking.tenantReference,
    occurredAt,
    ...(metadata !== undefined ? { metadata } : {}),
  });
}

export function emitBookingRescheduled(
  booking: Booking,
  previous: { startsAt: string; endsAt: string },
  occurredAt: string = new Date().toISOString(),
): BookingRescheduledEvent {
  return createBookingRescheduledEvent({
    bookingReference: booking.id,
    tenantReference: booking.tenantReference,
    previousStartAt: previous.startsAt,
    previousEndAt: previous.endsAt,
    newStartAt: booking.startsAt,
    newEndAt: booking.endsAt,
    occurredAt,
  });
}

export function emitBookingHoldExpired(
  booking: Booking,
  occurredAt: string = new Date().toISOString(),
): BookingHoldExpiredEvent {
  return createBookingHoldExpiredEvent({
    bookingReference: booking.id,
    tenantReference: booking.tenantReference,
    occurredAt,
  });
}
