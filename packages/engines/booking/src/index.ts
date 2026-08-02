/**
 * @motanos/booking — Shared Booking Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/booking → Domain Modules
 *
 * Must not depend on customer implementations, concrete domains,
 * persistence packages, or payment vendors.
 */

export const BOOKING_ENGINE = "@motanos/booking" as const;

export type {
  AvailabilityRule,
  FacilityId,
  Resource,
  ResourceId,
  ResourceType,
} from "./domain/resource";
export { RESOURCE_TYPES } from "./domain/resource";

export type {
  Booking,
  BookingId,
  BookingParticipant,
  ParticipantId,
  TimeInterval,
  UserId,
  WaitlistEntry,
} from "./domain/booking";

export type { Availability, AvailabilitySlot } from "./domain/availability";
export {
  bookingsConflict,
  checkRangeAvailability,
  intervalsOverlap,
  statusBlocksAvailability,
} from "./domain/availability";

export type {
  AvailabilityBlockingStatus,
  BookingEvent,
  BookingFinalStatus,
  BookingStatus,
  ReschedulableBookingStatus,
  ResourceStatus,
} from "./types/states";
export {
  allowedBookingTargets,
  AVAILABILITY_BLOCKING_STATUSES,
  BOOKING_EVENTS,
  BOOKING_FINAL_STATUSES,
  BOOKING_STATUSES,
  BOOKING_TRANSITIONS,
  canRescheduleBooking,
  canTransitionBooking,
  DEFAULT_HOLD_TTL_MINUTES,
  DEFAULT_WAITLIST_OFFER_TTL_MINUTES,
  isAvailabilityBlocking,
  isBookingFinal,
  isBookingStatus,
  NON_BLOCKING_STATUSES,
  RESCHEDULABLE_BOOKING_STATUSES,
  RESOURCE_STATUSES,
  shouldExpireBookingHold,
} from "./types/states";

export type {
  AvailabilityCheckInput,
  AvailabilityCheckResult,
  AvailabilityQuery,
  AvailabilityResult,
  BookingResult,
  CancelBookingInput,
  ConfirmBookingInput,
  CreateBookingInput,
  ExpireBookingHoldsInput,
  ExpireBookingHoldsResult,
  JoinWaitlistInput,
  ListBookingsQuery,
  RescheduleBookingInput,
  ResourceResult,
  UpdateBookingInput,
  WaitlistResult,
} from "./contracts";

export type {
  AvailabilityService,
  BookingService,
  ResourceService,
  WaitlistService,
} from "./services";
export {
  createBookingService,
  type CreateBookingServiceOptions,
} from "./services/create-booking-service";
export {
  commitBookingMutation,
  type BookingMutationCommitResult,
  type BookingMutationPhase,
} from "./services/booking-mutation-boundary";

export type { BookingQueryService } from "./queries";
export { createBookingQueryService } from "./queries";

export type {
  BookingAuthAction,
  BookingAuthOperation,
  BookingAuthorizationDecision,
  BookingAuthorizationGateway,
  BookingAuthorizationPolicy,
  BookingAuthorizationRequest,
  BookingAuthorizationResourceContext,
} from "./policies";
export {
  BOOKING_AUTH_ACTIONS,
  BOOKING_AUTH_OPERATIONS,
  bookingAuthActionFor,
  createBookingAuthorizationPolicy,
  isBookingAuthOperation,
} from "./policies";

export type {
  BookingRepository,
  FindBookingConflictsQuery,
} from "./repositories";
export {
  createInMemoryBookingRepository,
  patchInMemoryHoldExpiresAt,
} from "./repositories";

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
  DomainEvent,
} from "./events";
export {
  BOOKING_DOMAIN_EVENT_TYPES,
  createBookingCancelledEvent,
  createBookingConfirmedEvent,
  createBookingCreatedEvent,
  createBookingHoldExpiredEvent,
  createBookingRescheduledEvent,
  emitBookingCancelled,
  emitBookingConfirmed,
  emitBookingCreated,
  emitBookingHoldExpired,
  emitBookingRescheduled,
  isDomainEvent,
} from "./events";
