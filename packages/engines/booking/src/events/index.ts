export type { DomainEvent } from "./domain-event";
export { isDomainEvent } from "./domain-event";

export type {
  BookingCancelledEvent,
  BookingConfirmedEvent,
  BookingCreatedEvent,
  BookingDomainEvent,
  BookingDomainEventType,
  BookingHoldExpiredEvent,
  BookingRescheduledEvent,
  CreateBookingCancelledEventInput,
  CreateBookingConfirmedEventInput,
  CreateBookingCreatedEventInput,
  CreateBookingHoldExpiredEventInput,
  CreateBookingRescheduledEventInput,
} from "./booking-events";
export {
  BOOKING_DOMAIN_EVENT_TYPES,
  createBookingCancelledEvent,
  createBookingConfirmedEvent,
  createBookingCreatedEvent,
  createBookingHoldExpiredEvent,
  createBookingRescheduledEvent,
} from "./booking-events";

export {
  emitBookingCancelled,
  emitBookingConfirmed,
  emitBookingCreated,
  emitBookingHoldExpired,
  emitBookingRescheduled,
} from "./emit";
