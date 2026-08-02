/**
 * Booking mutation boundary consistency + failure tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Booking, BookingRepository } from "../src/index.js";
import {
  BOOKING_DOMAIN_EVENT_TYPES,
  commitBookingMutation,
  createBookingService,
  createInMemoryBookingRepository,
  patchInMemoryHoldExpiresAt,
} from "../src/index.js";

function failingOnUpdate(
  base: BookingRepository,
  message = "REPO_UPDATE_FAILED",
): BookingRepository {
  return {
    create: (b) => base.create(b),
    getById: (id) => base.getById(id),
    list: (q) => base.list(q),
    findConflicts: (q) => base.findConflicts(q),
    update: async () => {
      throw new Error(message);
    },
  };
}

function failingOnCreate(
  base: BookingRepository,
  message = "REPO_CREATE_FAILED",
): BookingRepository {
  return {
    ...base,
    create: async () => {
      throw new Error(message);
    },
  };
}

describe("Booking mutation boundary — success consistency", () => {
  it("Confirm: state Confirmed, repository updated, BookingConfirmedEvent", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });

    const confirmed = await booking.confirm({
      bookingId: created.booking.id,
    });

    assert.equal(confirmed.booking.status, "Confirmed");
    const stored = await repository.getById(created.booking.id);
    assert.equal(stored?.status, "Confirmed");
    assert.equal(
      confirmed.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingConfirmed,
    );
  });

  it("Cancel: persists Cancelled and produces BookingCancelledEvent", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });

    const cancelled = await booking.cancel({
      bookingId: created.booking.id,
    });

    assert.equal(cancelled.booking.status, "Cancelled");
    assert.equal(
      (await repository.getById(created.booking.id))?.status,
      "Cancelled",
    );
    assert.equal(
      cancelled.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingCancelled,
    );
  });

  it("Reschedule: updates window, keeps status, produces BookingRescheduledEvent", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
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

    assert.equal(rescheduled.booking.status, "Draft");
    assert.equal(rescheduled.booking.startsAt, "2026-08-02T14:00:00.000Z");
    assert.equal(rescheduled.booking.endsAt, "2026-08-02T15:00:00.000Z");
    const stored = await repository.getById(created.booking.id);
    assert.equal(stored?.startsAt, "2026-08-02T14:00:00.000Z");
    assert.equal(
      rescheduled.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingRescheduled,
    );
  });

  it("Expire: persists Expired and produces BookingHoldExpiredEvent", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });
    await patchInMemoryHoldExpiresAt(
      repository,
      created.booking.id,
      "2020-01-01T00:00:00.000Z",
    );

    const expired = await booking.expireHolds({
      now: "2026-08-02T12:00:00.000Z",
    });

    assert.equal(expired.expiredBookingIds.length, 1);
    assert.equal(
      (await repository.getById(created.booking.id))?.status,
      "Expired",
    );
    assert.equal(
      expired.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingHoldExpired,
    );
  });
});

describe("Booking mutation boundary — failure scenarios", () => {
  it("Repository update failure → no successful event (confirm)", async () => {
    const base = createInMemoryBookingRepository();
    const booking = createBookingService(base);
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });

    const failing = createBookingService(failingOnUpdate(base));
    await assert.rejects(
      () => failing.confirm({ bookingId: created.booking.id }),
      /REPO_UPDATE_FAILED/,
    );

    const stored = await base.getById(created.booking.id);
    assert.equal(stored?.status, "Draft");
  });

  it("Repository create failure → no BookingCreatedEvent", async () => {
    const base = createInMemoryBookingRepository();
    const booking = createBookingService(failingOnCreate(base));
    await assert.rejects(
      () =>
        booking.create({
          resourceId: "resource-1",
          ownerUserId: "customer-1",
          startsAt: "2026-08-02T10:00:00.000Z",
          endsAt: "2026-08-02T11:00:00.000Z",
        }),
      /REPO_CREATE_FAILED/,
    );
    assert.equal((await base.list({})).length, 0);
  });

  it("Validation failure → no persistence and no event (confirm Cancelled)", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });
    await booking.cancel({ bookingId: created.booking.id });

    await assert.rejects(
      () => booking.confirm({ bookingId: created.booking.id }),
      /Invalid confirm transition/,
    );

    const stored = await repository.getById(created.booking.id);
    assert.equal(stored?.status, "Cancelled");
  });

  it("Transition failure → no event (reschedule Cancelled)", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });
    await booking.cancel({ bookingId: created.booking.id });

    await assert.rejects(
      () =>
        booking.reschedule({
          bookingId: created.booking.id,
          startsAt: "2026-08-02T14:00:00.000Z",
          endsAt: "2026-08-02T15:00:00.000Z",
        }),
      /PRECONDITION/,
    );

    const stored = await repository.getById(created.booking.id);
    assert.equal(stored?.startsAt, "2026-08-02T10:00:00.000Z");
  });

  it("commitBookingMutation does not produce events when persist throws", async () => {
    let produced = false;
    await assert.rejects(
      () =>
        commitBookingMutation(
          async () => {
            throw new Error("PERSIST_FAIL");
          },
          (_persisted: Booking) => {
            produced = true;
            return {
              eventId: "x",
              eventType: BOOKING_DOMAIN_EVENT_TYPES.BookingConfirmed,
              occurredAt: "2026-08-02T00:00:00.000Z",
              bookingReference: "b",
            };
          },
        ),
      /PERSIST_FAIL/,
    );
    assert.equal(produced, false);
  });
});
