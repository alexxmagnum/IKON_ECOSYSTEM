/**
 * Booking domain event emission tests (engine helpers + mutation results).
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Booking, BookingService } from "../src/index.js";
import {
  BOOKING_DOMAIN_EVENT_TYPES,
  canRescheduleBooking,
  canTransitionBooking,
  checkRangeAvailability,
  DEFAULT_HOLD_TTL_MINUTES,
  emitBookingCancelled,
  emitBookingConfirmed,
  emitBookingCreated,
  emitBookingHoldExpired,
  emitBookingRescheduled,
  shouldExpireBookingHold,
} from "../src/index.js";

function createEmittingMemoryBooking(): BookingService {
  const store = new Map<string, Booking>();
  let seq = 0;

  return {
    async create(input) {
      seq += 1;
      const booking: Booking = {
        id: `booking-${seq}`,
        resourceId: input.resourceId,
        ownerUserId: input.ownerUserId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "Draft",
        holdExpiresAt: new Date(
          Date.now() + DEFAULT_HOLD_TTL_MINUTES * 60_000,
        ).toISOString(),
      };
      store.set(booking.id, booking);
      return { booking, events: [emitBookingCreated(booking)] };
    },
    async confirm(input) {
      const existing = store.get(input.bookingId);
      if (!existing) throw new Error("missing");
      if (
        !canTransitionBooking(
          existing.status,
          "Confirmed",
          "booking.confirmed_without_payment",
        )
      ) {
        throw new Error("invalid");
      }
      const { holdExpiresAt: _h, ...rest } = existing;
      const next: Booking = { ...rest, status: "Confirmed" };
      store.set(next.id, next);
      return { booking: next, events: [emitBookingConfirmed(next)] };
    },
    async update() {
      throw new Error("unused");
    },
    async reschedule(input) {
      const existing = store.get(input.bookingId);
      if (!existing) throw new Error("missing");
      if (!canRescheduleBooking(existing.status)) throw new Error("invalid");
      const check = checkRangeAvailability(
        existing.resourceId,
        { startsAt: input.startsAt, endsAt: input.endsAt },
        [...store.values()],
        { excludeBookingId: existing.id },
      );
      if (!check.available) throw new Error("conflict");
      const previous = {
        startsAt: existing.startsAt,
        endsAt: existing.endsAt,
      };
      const next: Booking = {
        ...existing,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
      };
      store.set(next.id, next);
      return {
        booking: next,
        events: [emitBookingRescheduled(next, previous)],
      };
    },
    async cancel(input) {
      const existing = store.get(input.bookingId);
      if (!existing) throw new Error("missing");
      if (
        !canTransitionBooking(
          existing.status,
          "Cancelled",
          "booking.cancelled_by_user",
        )
      ) {
        throw new Error("invalid");
      }
      const next: Booking = { ...existing, status: "Cancelled" };
      store.set(next.id, next);
      return { booking: next, events: [emitBookingCancelled(next)] };
    },
    async getById(id) {
      const booking = store.get(id);
      return booking ? { booking } : null;
    },
    async list() {
      return [...store.values()].map((booking) => ({ booking }));
    },
    async expireHolds(input) {
      const candidates = [...store.values()];
      const expired: { booking: Booking }[] = [];
      const expiredBookingIds: string[] = [];
      const events: ReturnType<typeof emitBookingHoldExpired>[] = [];
      for (const booking of candidates) {
        if (!shouldExpireBookingHold(booking, input.now)) continue;
        const { holdExpiresAt: _h, ...rest } = booking;
        const next: Booking = { ...rest, status: "Expired" };
        store.set(next.id, next);
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
    async checkAvailability() {
      return {
        available: true,
        resourceId: "r",
        startsAt: "",
        endsAt: "",
      };
    },
  };
}

describe("Booking event emission", () => {
  it("Create produces BookingCreatedEvent", async () => {
    const booking = createEmittingMemoryBooking();
    const result = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });
    assert.equal(result.events?.length, 1);
    assert.equal(
      result.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingCreated,
    );
    assert.equal(
      result.events?.[0] &&
        "bookingReference" in result.events[0] &&
        result.events[0].bookingReference,
      result.booking.id,
    );
  });

  it("Confirm produces BookingConfirmedEvent", async () => {
    const booking = createEmittingMemoryBooking();
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });
    const confirmed = await booking.confirm({
      bookingId: created.booking.id,
    });
    assert.equal(
      confirmed.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingConfirmed,
    );
  });

  it("Cancel produces BookingCancelledEvent", async () => {
    const booking = createEmittingMemoryBooking();
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });
    const cancelled = await booking.cancel({
      bookingId: created.booking.id,
    });
    assert.equal(
      cancelled.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingCancelled,
    );
  });

  it("Reschedule produces BookingRescheduledEvent", async () => {
    const booking = createEmittingMemoryBooking();
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });
    const rescheduled = await booking.reschedule({
      bookingId: created.booking.id,
      startsAt: "2026-08-02T14:00:00.000Z",
      endsAt: "2026-08-02T15:00:00.000Z",
    });
    const event = rescheduled.events?.[0];
    assert.equal(
      event?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingRescheduled,
    );
    assert.ok(event && "previousStartAt" in event);
    if (event && "previousStartAt" in event) {
      assert.equal(event.previousStartAt, "2026-08-02T10:00:00.000Z");
      assert.equal(event.newStartAt, "2026-08-02T14:00:00.000Z");
    }
  });

  it("Expire produces BookingHoldExpiredEvent", async () => {
    const booking = createEmittingMemoryBooking();
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });
    const current = await booking.getById(created.booking.id);
    assert.ok(current);
    current.booking.holdExpiresAt = "2020-01-01T00:00:00.000Z";

    const expired = await booking.expireHolds({
      now: "2026-08-02T12:00:00.000Z",
    });
    assert.equal(expired.events?.length, 1);
    assert.equal(
      expired.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingHoldExpired,
    );
  });
});
