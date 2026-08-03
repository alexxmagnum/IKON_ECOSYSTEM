import type { Booking, BookingStatus } from "@motanos/booking-lifecycle";

/**
 * Application CreateBooking input — opaque references only.
 * Maps onto @motanos/booking-lifecycle CreateBookingInput at the engine boundary.
 */
export interface CreateBookingInput {
  tenantReference: string;
  resourceReference: string;
  customerReference: string;
  startAt: string;
  endAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Shared booking view for create / confirm / cancel / get / list outputs.
 */
export interface BookingOutput {
  bookingReference: string;
  tenantReference: string;
  resourceReference: string;
  customerReference: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  holdExpiresAt?: string;
  metadata?: Record<string, unknown>;
}

/** @deprecated Prefer BookingOutput — kept as CreateBooking alias. */
export type CreateBookingOutput = BookingOutput;

export interface ConfirmBookingInput {
  tenantReference: string;
  bookingReference: string;
  metadata?: Record<string, unknown>;
}

export type ConfirmBookingOutput = BookingOutput;

export interface CancelBookingInput {
  tenantReference: string;
  bookingReference: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export type CancelBookingOutput = BookingOutput;

export interface GetBookingInput {
  tenantReference: string;
  bookingReference: string;
  metadata?: Record<string, unknown>;
}

export type GetBookingOutput = BookingOutput;

export interface ListBookingsInput {
  tenantReference: string;
  resourceReference?: string;
  customerReference?: string;
  startAt?: string;
  endAt?: string;
  status?: BookingStatus | BookingStatus[];
  metadata?: Record<string, unknown>;
}

export interface ListBookingsOutput {
  bookings: BookingOutput[];
}

export interface RescheduleBookingInput {
  tenantReference: string;
  bookingReference: string;
  newStartAt: string;
  newEndAt: string;
  metadata?: Record<string, unknown>;
}

export type RescheduleBookingOutput = BookingOutput;

export interface ExpireBookingHoldsInput {
  tenantReference: string;
  /** Evaluation instant (ISO-8601). */
  now: string;
  /** Optional candidate opaque references; omit = all known bookings. */
  bookingReferences?: string[];
  metadata?: Record<string, unknown>;
}

export interface ExpireBookingHoldsOutput {
  bookings: BookingOutput[];
  expiredBookingReferences: string[];
  processedCount: number;
}

export function toBookingOutput(booking: Booking): BookingOutput {
  return {
    bookingReference: booking.id,
    tenantReference: booking.tenantReference,
    resourceReference: booking.resourceId,
    customerReference: booking.ownerUserId,
    startAt: booking.startsAt,
    endAt: booking.endsAt,
    status: booking.status,
    ...(booking.holdExpiresAt !== undefined
      ? { holdExpiresAt: booking.holdExpiresAt }
      : {}),
    ...(booking.metadata !== undefined ? { metadata: booking.metadata } : {}),
  };
}
