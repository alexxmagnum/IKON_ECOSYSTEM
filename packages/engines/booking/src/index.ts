/**
 * @motanos/booking — Booking Engine Boundary foundation.
 *
 * MotanOS Core → Shared Engines → @motanos/booking
 *
 * Booking = reservation existence for a business context.
 * Operational motor lives in @motanos/booking-lifecycle.
 *
 * Must not depend on collect packages, tariff packages, open-slot packages,
 * unit packages, timeline packages, fiscal packages, compute vendors,
 * or persistence vendors.
 *
 * @see DEC-BOOKING-BOUNDARY-001
 */

export const BOOKING_ENGINE = "@motanos/booking" as const;

export type {
  Booking,
  BookingKind,
  BookingPort,
  BookingStatus,
  CreateBookingInput,
  CreateBookingOptions,
} from "./bookings";
export {
  BOOKING_KINDS,
  BOOKING_KIND_VALUES,
  BOOKING_SLOT_REF_KEY,
  BOOKING_STATUSES,
  BOOKING_STATUS_VALUES,
  BOOKING_UNIT_REF_KEY,
  createBooking,
  isBooking,
  isBookingKind,
  isBookingPort,
  isBookingStatus,
  resetBookingReferenceSequence,
} from "./bookings";
