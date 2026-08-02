import type { Booking, BookingService } from "@motanos/booking";
import { DEFAULT_HOLD_TTL_MINUTES } from "@motanos/booking";

/**
 * Temporary in-memory BookingService for composition bootstrap / tests.
 * Not a persistence adapter — no external systems.
 * Not part of the public @motanos/runtime API.
 */
export function createInMemoryBookingService(): BookingService {
  const bookings = new Map<string, Booking>();
  let sequence = 0;

  return {
    async create(input) {
      sequence += 1;
      const id = `booking-${sequence}`;
      const holdExpiresAt = new Date(
        Date.now() + DEFAULT_HOLD_TTL_MINUTES * 60_000,
      ).toISOString();
      const booking: Booking = {
        id,
        resourceId: input.resourceId,
        ownerUserId: input.ownerUserId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "Draft",
        holdExpiresAt,
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      };
      bookings.set(id, booking);
      return { booking };
    },
    async update(input) {
      const existing = bookings.get(input.bookingId);
      if (!existing) {
        throw new Error(`Booking not found: ${input.bookingId}`);
      }
      const next: Booking = {
        ...existing,
        ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
        ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      };
      bookings.set(next.id, next);
      return { booking: next };
    },
    async cancel(input) {
      const existing = bookings.get(input.bookingId);
      if (!existing) {
        throw new Error(`Booking not found: ${input.bookingId}`);
      }
      const next: Booking = { ...existing, status: "Cancelled" };
      bookings.set(next.id, next);
      return { booking: next };
    },
    async getById(bookingId) {
      const booking = bookings.get(bookingId);
      return booking ? { booking } : null;
    },
    async list(query) {
      return [...bookings.values()]
        .filter((booking) => {
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
          return true;
        })
        .map((booking) => ({ booking }));
    },
  };
}
