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
