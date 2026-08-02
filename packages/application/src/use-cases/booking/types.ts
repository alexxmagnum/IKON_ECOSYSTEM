import type { Booking, BookingStatus } from "@motanos/booking";

/**
 * Application CreateBooking input — opaque references only.
 * Maps onto @motanos/booking CreateBookingInput at the engine boundary.
 */
export interface CreateBookingInput {
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
  bookingReference: string;
  metadata?: Record<string, unknown>;
}

export type ConfirmBookingOutput = BookingOutput;

export interface CancelBookingInput {
  bookingReference: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export type CancelBookingOutput = BookingOutput;

export interface GetBookingInput {
  bookingReference: string;
  metadata?: Record<string, unknown>;
}

export type GetBookingOutput = BookingOutput;

export interface ListBookingsInput {
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
  bookingReference: string;
  newStartAt: string;
  newEndAt: string;
  metadata?: Record<string, unknown>;
}

export type RescheduleBookingOutput = BookingOutput;

export function toBookingOutput(booking: Booking): BookingOutput {
  return {
    bookingReference: booking.id,
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
