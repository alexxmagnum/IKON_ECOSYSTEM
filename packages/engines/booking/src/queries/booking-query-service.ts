import type {
  AvailabilityCheckInput,
  AvailabilityCheckResult,
  ListBookingsQuery,
} from "../contracts";
import type { Booking, BookingId } from "../domain/booking";

/**
 * Read-side contract for Booking (foundation query boundary).
 * No mutations, no domain events, no lifecycle changes.
 *
 * @see DEC-BOOKING-QUERY-002
 */
export interface BookingQueryService {
  getBooking(bookingId: BookingId): Promise<Booking | null>;
  listBookings(query?: ListBookingsQuery): Promise<Booking[]>;
  checkAvailability(
    input: AvailabilityCheckInput,
  ): Promise<AvailabilityCheckResult>;
}
