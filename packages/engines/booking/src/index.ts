/**
 * @motanos/booking — Shared Booking Engine foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/booking → Domain Modules
 *
 * Must not depend on customer implementations, concrete domains, database, or payments.
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
  intervalsOverlap,
  statusBlocksAvailability,
} from "./domain/availability";

export type {
  AvailabilityBlockingStatus,
  BookingEvent,
  BookingFinalStatus,
  BookingStatus,
  ResourceStatus,
} from "./types/states";
export {
  allowedBookingTargets,
  AVAILABILITY_BLOCKING_STATUSES,
  BOOKING_EVENTS,
  BOOKING_FINAL_STATUSES,
  BOOKING_STATUSES,
  BOOKING_TRANSITIONS,
  canTransitionBooking,
  DEFAULT_HOLD_TTL_MINUTES,
  DEFAULT_WAITLIST_OFFER_TTL_MINUTES,
  isAvailabilityBlocking,
  isBookingFinal,
  isBookingStatus,
  NON_BLOCKING_STATUSES,
  RESOURCE_STATUSES,
} from "./types/states";

export type {
  AvailabilityQuery,
  AvailabilityResult,
  BookingResult,
  CancelBookingInput,
  ConfirmBookingInput,
  CreateBookingInput,
  JoinWaitlistInput,
  ListBookingsQuery,
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
