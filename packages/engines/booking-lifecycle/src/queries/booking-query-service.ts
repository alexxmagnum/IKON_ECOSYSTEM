import type {
  AvailabilityCheckInput,
  AvailabilityCheckResult,
  ListBookingsQuery,
} from "../contracts";
import type { Booking, BookingId } from "../domain/booking";

/**
 * Read-side contract for Booking (foundation query boundary).
 * Tenant scope is required on every read (DEC-BOOKING-TENANT-001).
 */
export interface BookingQueryService {
  getBooking(
    tenantReference: string,
    bookingId: BookingId,
  ): Promise<Booking | null>;
  listBookings(
    tenantReference: string,
    query?: ListBookingsQuery,
  ): Promise<Booking[]>;
  checkAvailability(
    input: AvailabilityCheckInput,
  ): Promise<AvailabilityCheckResult>;
}
