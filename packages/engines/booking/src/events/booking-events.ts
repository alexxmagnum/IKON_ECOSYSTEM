import type { DomainEvent } from "./domain-event";

/**
 * Booking domain event type tokens.
 * Aligned with lifecycle facts — not transport topics.
 */
export const BOOKING_DOMAIN_EVENT_TYPES = {
  BookingCreated: "booking.created",
  BookingConfirmed: "booking.confirmed",
  BookingCancelled: "booking.cancelled",
  BookingRescheduled: "booking.rescheduled",
  BookingHoldExpired: "booking.hold_expired",
} as const;

export type BookingDomainEventType =
  (typeof BOOKING_DOMAIN_EVENT_TYPES)[keyof typeof BOOKING_DOMAIN_EVENT_TYPES];

export interface BookingCreatedEvent extends DomainEvent {
  eventType: typeof BOOKING_DOMAIN_EVENT_TYPES.BookingCreated;
  bookingReference: string;
  resourceReference: string;
  customerReference: string;
}

export interface BookingConfirmedEvent extends DomainEvent {
  eventType: typeof BOOKING_DOMAIN_EVENT_TYPES.BookingConfirmed;
  bookingReference: string;
  /** SoT transition context (Draft → Confirmed via booking.confirmed_without_payment). */
  lifecycleEvent?: "booking.confirmed_without_payment";
}

export interface BookingCancelledEvent extends DomainEvent {
  eventType: typeof BOOKING_DOMAIN_EVENT_TYPES.BookingCancelled;
  bookingReference: string;
  /** SoT cancel path when known (e.g. booking.cancelled_by_user). */
  lifecycleEvent?: "booking.cancelled_by_user";
}

export interface BookingRescheduledEvent extends DomainEvent {
  eventType: typeof BOOKING_DOMAIN_EVENT_TYPES.BookingRescheduled;
  bookingReference: string;
  previousStartAt: string;
  previousEndAt: string;
  newStartAt: string;
  newEndAt: string;
}

export interface BookingHoldExpiredEvent extends DomainEvent {
  eventType: typeof BOOKING_DOMAIN_EVENT_TYPES.BookingHoldExpired;
  bookingReference: string;
}

export type BookingDomainEvent =
  | BookingCreatedEvent
  | BookingConfirmedEvent
  | BookingCancelledEvent
  | BookingRescheduledEvent
  | BookingHoldExpiredEvent;

export interface CreateBookingCreatedEventInput {
  bookingReference: string;
  resourceReference: string;
  customerReference: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export function createBookingCreatedEvent(
  input: CreateBookingCreatedEventInput,
): BookingCreatedEvent {
  return {
    eventType: BOOKING_DOMAIN_EVENT_TYPES.BookingCreated,
    aggregateReference: input.bookingReference,
    bookingReference: input.bookingReference,
    resourceReference: input.resourceReference,
    customerReference: input.customerReference,
    occurredAt: input.occurredAt,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

export interface CreateBookingConfirmedEventInput {
  bookingReference: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export function createBookingConfirmedEvent(
  input: CreateBookingConfirmedEventInput,
): BookingConfirmedEvent {
  return {
    eventType: BOOKING_DOMAIN_EVENT_TYPES.BookingConfirmed,
    aggregateReference: input.bookingReference,
    bookingReference: input.bookingReference,
    occurredAt: input.occurredAt,
    lifecycleEvent: "booking.confirmed_without_payment",
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

export interface CreateBookingCancelledEventInput {
  bookingReference: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export function createBookingCancelledEvent(
  input: CreateBookingCancelledEventInput,
): BookingCancelledEvent {
  return {
    eventType: BOOKING_DOMAIN_EVENT_TYPES.BookingCancelled,
    aggregateReference: input.bookingReference,
    bookingReference: input.bookingReference,
    occurredAt: input.occurredAt,
    lifecycleEvent: "booking.cancelled_by_user",
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

export interface CreateBookingRescheduledEventInput {
  bookingReference: string;
  previousStartAt: string;
  previousEndAt: string;
  newStartAt: string;
  newEndAt: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export function createBookingRescheduledEvent(
  input: CreateBookingRescheduledEventInput,
): BookingRescheduledEvent {
  return {
    eventType: BOOKING_DOMAIN_EVENT_TYPES.BookingRescheduled,
    aggregateReference: input.bookingReference,
    bookingReference: input.bookingReference,
    previousStartAt: input.previousStartAt,
    previousEndAt: input.previousEndAt,
    newStartAt: input.newStartAt,
    newEndAt: input.newEndAt,
    occurredAt: input.occurredAt,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

export interface CreateBookingHoldExpiredEventInput {
  bookingReference: string;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export function createBookingHoldExpiredEvent(
  input: CreateBookingHoldExpiredEventInput,
): BookingHoldExpiredEvent {
  return {
    eventType: BOOKING_DOMAIN_EVENT_TYPES.BookingHoldExpired,
    aggregateReference: input.bookingReference,
    bookingReference: input.bookingReference,
    occurredAt: input.occurredAt,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}
