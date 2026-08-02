import type { Booking, BookingService } from "@motanos/booking";
import {
  canRescheduleBooking,
  canTransitionBooking,
  checkRangeAvailability,
  DEFAULT_HOLD_TTL_MINUTES,
  emitBookingCancelled,
  emitBookingConfirmed,
  emitBookingCreated,
  emitBookingHoldExpired,
  emitBookingRescheduled,
  intervalsOverlap,
  shouldExpireBookingHold,
} from "@motanos/booking";

/**
 * Temporary in-memory BookingService for composition bootstrap / tests.
 * Enforces SoT transitions for confirm/cancel/reschedule. Not part of public API.
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
      return {
        booking,
        events: [emitBookingCreated(booking)],
      };
    },
    async confirm(input) {
      const existing = bookings.get(input.bookingId);
      if (!existing) {
        throw new Error(`Booking not found: ${input.bookingId}`);
      }
      if (
        !canTransitionBooking(
          existing.status,
          "Confirmed",
          "booking.confirmed_without_payment",
        )
      ) {
        throw new Error(
          `Invalid confirm transition from ${existing.status}`,
        );
      }
      const { holdExpiresAt: _hold, ...rest } = existing;
      const next: Booking = {
        ...rest,
        status: "Confirmed",
        ...(input.metadata !== undefined
          ? {
              metadata: {
                ...(existing.metadata ?? {}),
                ...input.metadata,
              },
            }
          : {}),
      };
      bookings.set(next.id, next);
      return {
        booking: next,
        events: [emitBookingConfirmed(next)],
      };
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
      if (input.metadata?.__holdExpiresAt !== undefined) {
        const hold = input.metadata.__holdExpiresAt;
        if (typeof hold === "string") {
          next.holdExpiresAt = hold;
        }
      }
      bookings.set(next.id, next);
      return { booking: next };
    },
    async reschedule(input) {
      const existing = bookings.get(input.bookingId);
      if (!existing) {
        throw new Error(`NOT_FOUND:${input.bookingId}`);
      }
      if (!canRescheduleBooking(existing.status)) {
        throw new Error(
          `PRECONDITION:Cannot reschedule booking from status ${existing.status}`,
        );
      }
      const availability = checkRangeAvailability(
        existing.resourceId,
        { startsAt: input.startsAt, endsAt: input.endsAt },
        [...bookings.values()],
        { excludeBookingId: existing.id },
      );
      if (!availability.available) {
        throw new Error(`CONFLICT:${availability.reason ?? "overlap"}`);
      }
      const previous = {
        startsAt: existing.startsAt,
        endsAt: existing.endsAt,
      };
      const next: Booking = {
        ...existing,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        ...(input.metadata !== undefined
          ? {
              metadata: {
                ...(existing.metadata ?? {}),
                ...input.metadata,
              },
            }
          : {}),
      };
      bookings.set(next.id, next);
      return {
        booking: next,
        events: [emitBookingRescheduled(next, previous)],
      };
    },
    async cancel(input) {
      const existing = bookings.get(input.bookingId);
      if (!existing) {
        throw new Error(`Booking not found: ${input.bookingId}`);
      }
      if (
        !canTransitionBooking(
          existing.status,
          "Cancelled",
          "booking.cancelled_by_user",
        )
      ) {
        throw new Error(
          `Invalid cancel transition from ${existing.status}`,
        );
      }
      const next: Booking = { ...existing, status: "Cancelled" };
      bookings.set(next.id, next);
      return {
        booking: next,
        events: [
          emitBookingCancelled(
            next,
            new Date().toISOString(),
            input.reason !== undefined ? { reason: input.reason } : undefined,
          ),
        ],
      };
    },
    async expireHolds(input) {
      const candidates =
        input.bookingIds !== undefined
          ? input.bookingIds
              .map((id) => bookings.get(id))
              .filter((b): b is Booking => b !== undefined)
          : [...bookings.values()];

      const expired: { booking: Booking }[] = [];
      const expiredBookingIds: string[] = [];
      const events: ReturnType<typeof emitBookingHoldExpired>[] = [];

      for (const booking of candidates) {
        if (!shouldExpireBookingHold(booking, input.now)) {
          continue;
        }
        const { holdExpiresAt: _hold, ...rest } = booking;
        const next: Booking = { ...rest, status: "Expired" };
        bookings.set(next.id, next);
        expired.push({ booking: next });
        expiredBookingIds.push(next.id);
        events.push(emitBookingHoldExpired(next, input.now));
      }

      return {
        expired,
        expiredBookingIds,
        processedCount: candidates.length,
        ...(events.length > 0 ? { events } : {}),
      };
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
          if (query.range) {
            if (!intervalsOverlap(booking, query.range)) {
              return false;
            }
          }
          return true;
        })
        .map((booking) => ({ booking }));
    },
    async checkAvailability(input) {
      const check = checkRangeAvailability(
        input.resourceId,
        { startsAt: input.startsAt, endsAt: input.endsAt },
        [...bookings.values()],
      );
      return {
        available: check.available,
        resourceId: input.resourceId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        ...(check.reason !== undefined ? { reason: check.reason } : {}),
      };
    },
  };
}
