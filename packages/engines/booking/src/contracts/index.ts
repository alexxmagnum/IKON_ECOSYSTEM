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

/**
 * API-oriented TypeScript contracts for a future Booking HTTP surface.
 * No route handlers or transport concerns live here.
 */

export interface CreateBookingInput {
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
  bookingId: BookingId;
  startsAt?: string;
  endsAt?: string;
  status?: BookingStatus;
  participantUserIds?: UserId[];
  metadata?: Record<string, unknown>;
}

export interface CancelBookingInput {
  bookingId: BookingId;
  reason?: string;
}

/**
 * Confirm a booking without payment capture in this foundation path.
 * SoT transition: Draft → Confirmed via booking.confirmed_without_payment.
 * Payment-required confirmation remains a future composition decision.
 */
export interface ConfirmBookingInput {
  bookingId: BookingId;
  metadata?: Record<string, unknown>;
}

/**
 * Reschedule — update booking time window (BR-0033).
 * Does not change BOOKING status; revalidates availability (BR-0031).
 * Engine uses bookingId / startsAt / endsAt (Application maps opaque refs).
 */
export interface RescheduleBookingInput {
  bookingId: BookingId;
  startsAt: string;
  endsAt: string;
  metadata?: Record<string, unknown>;
}

export interface BookingResult {
  booking: Booking;
  participants?: BookingParticipant[];
}

/**
 * Result of a single-range availability check (BR-0031 overlap semantics).
 * Foundation only — no calendar providers or persistence adapters.
 */
export interface AvailabilityCheckInput {
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
