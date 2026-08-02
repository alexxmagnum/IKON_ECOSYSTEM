import type { Booking, BookingId, TimeInterval } from "../domain/booking";
import type { ResourceId } from "../domain/resource";
import type { ListBookingsQuery } from "../contracts";

/**
 * Persistence boundary for Booking aggregates.
 * Owned by @motanos/booking — adapters live in Runtime / future infra packages.
 * No SQL, ORM, or vendor clients here.
 */

export interface FindBookingConflictsQuery {
  resourceId: ResourceId;
  range: TimeInterval;
  /** Exclude this booking (reschedule self-window). */
  excludeBookingId?: BookingId;
}

/**
 * Abstract store for Booking aggregates.
 * Application must not depend on this contract — only BookingService.
 */
export interface BookingRepository {
  create(booking: Booking): Promise<Booking>;
  getById(bookingId: BookingId): Promise<Booking | null>;
  /**
   * Filtered listing — same filter vocabulary as ListBookingsQuery
   * (resourceId, ownerUserId, status, range).
   */
  list(query?: ListBookingsQuery): Promise<Booking[]>;
  update(booking: Booking): Promise<Booking>;
  /**
   * Availability-blocking overlaps for a resource interval (BR-0031).
   */
  findConflicts(query: FindBookingConflictsQuery): Promise<Booking[]>;
}
