import type {
  AvailabilityCheckInput,
  AvailabilityCheckResult,
  AvailabilityQuery,
  AvailabilityResult,
  BookingResult,
  CancelBookingInput,
  ConfirmBookingInput,
  CreateBookingInput,
  JoinWaitlistInput,
  ListBookingsQuery,
  RescheduleBookingInput,
  UpdateBookingInput,
  WaitlistResult,
  ExpireBookingHoldsInput,
  ExpireBookingHoldsResult,
} from "../contracts";
import type { BookingId } from "../domain/booking";
import type { Resource, ResourceId } from "../domain/resource";

/**
 * Service contracts for the Booking Engine.
 * Implementations (adapters) arrive in later phases.
 */

export interface BookingService {
  create(input: CreateBookingInput): Promise<BookingResult>;
  confirm(input: ConfirmBookingInput): Promise<BookingResult>;
  update(input: UpdateBookingInput): Promise<BookingResult>;
  /**
   * Move a booking to a new time window (status unchanged when allowed).
   */
  reschedule(input: RescheduleBookingInput): Promise<BookingResult>;
  cancel(input: CancelBookingInput): Promise<BookingResult>;
  getById(bookingId: BookingId): Promise<BookingResult | null>;
  list(query: ListBookingsQuery): Promise<BookingResult[]>;
  /**
   * Expire Draft holds past holdExpiresAt (Draft → Expired / booking.hold_expired).
   * Foundation only — no cron/scheduler; callers supply `now`.
   */
  expireHolds(input: ExpireBookingHoldsInput): Promise<ExpireBookingHoldsResult>;
  /**
   * Check whether a resource interval is free of availability-blocking overlaps.
   */
  checkAvailability(
    input: AvailabilityCheckInput,
  ): Promise<AvailabilityCheckResult>;
}

export interface AvailabilityService {
  query(query: AvailabilityQuery): Promise<AvailabilityResult>;
  check(input: AvailabilityCheckInput): Promise<AvailabilityCheckResult>;
}

export interface ResourceService {
  getById(resourceId: ResourceId): Promise<Resource | null>;
  list(): Promise<Resource[]>;
}

export interface WaitlistService {
  join(input: JoinWaitlistInput): Promise<WaitlistResult>;
}
