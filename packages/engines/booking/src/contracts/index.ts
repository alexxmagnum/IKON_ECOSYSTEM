import type {
  Booking,
  BookingId,
  BookingParticipant,
  TimeInterval,
  UserId,
  WaitlistEntry,
} from "../domain/booking";
import type { Availability, AvailabilitySlot } from "../domain/availability";
import type { Resource, ResourceId } from "../domain/resource";
import type { BookingStatus } from "../types/states";
import type {
  BookingDomainEvent,
  BookingHoldExpiredEvent,
} from "../events/booking-events";

/**
 * API-oriented TypeScript contracts for a future Booking HTTP surface.
 * No route handlers or transport concerns live here.
 */

export interface CreateBookingInput {
  tenantReference: string;
  resourceId: ResourceId;
  ownerUserId: UserId;
  startsAt: string;
  endsAt: string;
  experienceId?: string;
  eventId?: string;
  participantUserIds?: UserId[];
  metadata?: Record<string, unknown>;
}

export interface UpdateBookingInput {
  tenantReference: string;
  bookingId: BookingId;
  startsAt?: string;
  endsAt?: string;
  status?: BookingStatus;
  participantUserIds?: UserId[];
  metadata?: Record<string, unknown>;
}

export interface CancelBookingInput {
  tenantReference: string;
  bookingId: BookingId;
  reason?: string;
}

/**
 * Confirm a booking without payment capture in this foundation path.
 * SoT transition: Draft → Confirmed via booking.confirmed_without_payment.
 * Payment-required confirmation remains a future composition decision.
 */
export interface ConfirmBookingInput {
  tenantReference: string;
  bookingId: BookingId;
  metadata?: Record<string, unknown>;
}

/**
 * Reschedule — update booking time window (BR-0033).
 * Does not change BOOKING status; revalidates availability (BR-0031).
 * Engine uses bookingId / startsAt / endsAt (Application maps opaque refs).
 */
export interface RescheduleBookingInput {
  tenantReference: string;
  bookingId: BookingId;
  startsAt: string;
  endsAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Expire Draft holds whose holdExpiresAt <= now (BR-0037 / booking.hold_expired).
 * Adapters evaluate known bookings; optional bookingIds narrows candidates.
 */
export interface ExpireBookingHoldsInput {
  tenantReference: string;
  /** Evaluation instant (ISO-8601). */
  now: string;
  /** Optional candidate ids; omit = evaluate all bookings known to the adapter. */
  bookingIds?: BookingId[];
}

export interface ExpireBookingHoldsResult {
  expired: BookingResult[];
  expiredBookingIds: BookingId[];
  /** Number of candidates evaluated (not only expired). */
  processedCount: number;
  /** Domain events produced for expired holds (BookingHoldExpired). */
  events?: BookingHoldExpiredEvent[];
}

export interface BookingResult {
  booking: Booking;
  participants?: BookingParticipant[];
  /** Domain events produced by this mutation (empty/omitted for reads). */
  events?: BookingDomainEvent[];
}

/**
 * Result of a single-range availability check (BR-0031 overlap semantics).
 * Foundation only — no calendar providers or persistence adapters.
 */
export interface AvailabilityCheckInput {
  tenantReference: string;
  resourceId: ResourceId;
  startsAt: string;
  endsAt: string;
}

export interface AvailabilityCheckResult {
  available: boolean;
  /** Opaque explanation when unavailable (e.g. overlap reference). */
  reason?: string;
  resourceId: ResourceId;
  startsAt: string;
  endsAt: string;
}

export interface AvailabilityQuery {
  resourceId: ResourceId;
  startsAt: string;
  endsAt: string;
  /** Optional slot granularity hint in minutes for future engines. */
  slotMinutes?: number;
}

export interface AvailabilityResult {
  availability: Availability;
}

export interface ListBookingsQuery {
  resourceId?: ResourceId;
  ownerUserId?: UserId;
  status?: BookingStatus | BookingStatus[];
  range?: TimeInterval;
}

export interface JoinWaitlistInput {
  resourceId: ResourceId;
  userId: UserId;
  metadata?: Record<string, unknown>;
}

export interface WaitlistResult {
  entry: WaitlistEntry;
}

export interface ResourceResult {
  resource: Resource;
}

export type { AvailabilitySlot };
