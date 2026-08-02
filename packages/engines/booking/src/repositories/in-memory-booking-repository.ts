import type { Booking, BookingId } from "../domain/booking";
import type { ListBookingsQuery } from "../contracts";
import {
  bookingsConflict,
  intervalsOverlap,
} from "../domain/availability";
import type {
  BookingRepository,
  FindBookingConflictsQuery,
} from "./booking-repository";

/**
 * In-memory BookingRepository — foundation adapter for tests / composition.
 * Not a production persistence technology.
 */
export function createInMemoryBookingRepository(): BookingRepository {
  const bookings = new Map<string, Booking>();

  return {
    async create(booking) {
      if (bookings.has(booking.id)) {
        throw new Error(`Booking already exists: ${booking.id}`);
      }
      const stored: Booking = { ...booking };
      bookings.set(stored.id, stored);
      return { ...stored };
    },

    async getById(bookingId) {
      const booking = bookings.get(bookingId);
      return booking ? { ...booking } : null;
    },

    async list(query: ListBookingsQuery = {}) {
      return [...bookings.values()]
        .filter((booking) => matchesListQuery(booking, query))
        .map((booking) => ({ ...booking }));
    },

    async update(booking) {
      if (!bookings.has(booking.id)) {
        throw new Error(`Booking not found: ${booking.id}`);
      }
      const stored: Booking = { ...booking };
      bookings.set(stored.id, stored);
      return { ...stored };
    },

    async findConflicts(query: FindBookingConflictsQuery) {
      const probe: Booking = {
        id: query.excludeBookingId ?? "__conflict-probe__",
        resourceId: query.resourceId,
        ownerUserId: "__probe__",
        startsAt: query.range.startsAt,
        endsAt: query.range.endsAt,
        status: "Draft",
      };

      return [...bookings.values()]
        .filter((booking) => {
          if (
            query.excludeBookingId !== undefined &&
            booking.id === query.excludeBookingId
          ) {
            return false;
          }
          return bookingsConflict(probe, booking);
        })
        .map((booking) => ({ ...booking }));
    },
  };
}

function matchesListQuery(
  booking: Booking,
  query: ListBookingsQuery,
): boolean {
  if (query.resourceId && booking.resourceId !== query.resourceId) {
    return false;
  }
  if (query.ownerUserId && booking.ownerUserId !== query.ownerUserId) {
    return false;
  }
  if (query.status) {
    const statuses = Array.isArray(query.status)
      ? query.status
      : [query.status];
    if (!statuses.includes(booking.status)) {
      return false;
    }
  }
  if (query.range && !intervalsOverlap(booking, query.range)) {
    return false;
  }
  return true;
}

/** Test helper — mutate holdExpiresAt on a stored aggregate by id. */
export function patchInMemoryHoldExpiresAt(
  repository: BookingRepository,
  bookingId: BookingId,
  holdExpiresAt: string,
): Promise<Booking | null> {
  return repository.getById(bookingId).then(async (booking) => {
    if (!booking) return null;
    return repository.update({ ...booking, holdExpiresAt });
  });
}
