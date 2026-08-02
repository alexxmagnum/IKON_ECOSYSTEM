import type { BookingStatus } from "@motanos/booking";

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
 * Application CreateBooking output — still opaque; status from Booking SoT.
 */
export interface CreateBookingOutput {
  bookingReference: string;
  resourceReference: string;
  customerReference: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  holdExpiresAt?: string;
  metadata?: Record<string, unknown>;
}
