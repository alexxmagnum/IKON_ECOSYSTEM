import type { Booking, BookingId, TimeInterval } from "../domain/booking";
import type { ResourceId } from "../domain/resource";
import type { ListBookingsQuery } from "../contracts";
import type { BookingTenantContext } from "../context/booking-tenant-context";

/**
 * Persistence boundary for Booking aggregates.
 * Every method requires explicit tenant context (DEC-BOOKING-TENANT-001).
 */

export interface FindBookingConflictsQuery {
  resourceId: ResourceId;
  range: TimeInterval;
  /** Exclude this booking (reschedule self-window). */
  excludeBookingId?: BookingId;
}

/**
 * Abstract store for Booking aggregates.
 * Application must not depend on this contract — only BookingService / QueryService.
 */
export interface BookingRepository {
  create(
    tenant: BookingTenantContext,
    booking: Booking,
  ): Promise<Booking>;
  /**
   * Returns null when missing or when the booking belongs to another tenant.
   */
  getById(
    tenant: BookingTenantContext,
    bookingId: BookingId,
  ): Promise<Booking | null>;
  list(
    tenant: BookingTenantContext,
    query?: ListBookingsQuery,
  ): Promise<Booking[]>;
  update(
    tenant: BookingTenantContext,
    booking: Booking,
  ): Promise<Booking>;
  findConflicts(
    tenant: BookingTenantContext,
    query: FindBookingConflictsQuery,
  ): Promise<Booking[]>;
}
