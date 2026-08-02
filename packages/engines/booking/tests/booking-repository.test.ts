/**
 * BookingRepository contract + InMemory adapter tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Booking } from "../src/index.js";
import {
  BOOKING_DOMAIN_EVENT_TYPES,
  createBookingService,
  createInMemoryBookingRepository,
  patchInMemoryHoldExpiresAt,
} from "../src/index.js";

function sampleBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "booking-1",
    resourceId: "resource-1",
    ownerUserId: "customer-1",
    startsAt: "2026-08-02T10:00:00.000Z",
    endsAt: "2026-08-02T11:00:00.000Z",
    status: "Draft",
    holdExpiresAt: "2026-08-02T10:15:00.000Z",
    ...overrides,
  };
}

describe("BookingRepository contract (InMemory)", () => {
  it("create stores and returns booking", async () => {
    const repo = createInMemoryBookingRepository();
    const created = await repo.create(sampleBooking());
    assert.equal(created.id, "booking-1");
    assert.equal(created.status, "Draft");
  });

  it("getById returns booking or null", async () => {
    const repo = createInMemoryBookingRepository();
    await repo.create(sampleBooking());
    const found = await repo.getById("booking-1");
    assert.ok(found);
    assert.equal(found.resourceId, "resource-1");
    assert.equal(await repo.getById("missing"), null);
  });

  it("list supports resourceId, ownerUserId, status, range filters", async () => {
    const repo = createInMemoryBookingRepository();
    await repo.create(sampleBooking());
    await repo.create(
      sampleBooking({
        id: "booking-2",
        resourceId: "resource-2",
        ownerUserId: "customer-2",
        status: "Confirmed",
        startsAt: "2026-08-02T12:00:00.000Z",
        endsAt: "2026-08-02T13:00:00.000Z",
      }),
    );

    assert.equal((await repo.list({ resourceId: "resource-1" })).length, 1);
    assert.equal((await repo.list({ ownerUserId: "customer-2" })).length, 1);
    assert.equal((await repo.list({ status: "Confirmed" })).length, 1);
    assert.equal(
      (
        await repo.list({
          range: {
            startsAt: "2026-08-02T09:30:00.000Z",
            endsAt: "2026-08-02T10:30:00.000Z",
          },
        })
      ).length,
      1,
    );
  });

  it("update replaces stored aggregate", async () => {
    const repo = createInMemoryBookingRepository();
    await repo.create(sampleBooking());
    const updated = await repo.update(
      sampleBooking({ status: "Confirmed", holdExpiresAt: undefined }),
    );
    assert.equal(updated.status, "Confirmed");
    const loaded = await repo.getById("booking-1");
    assert.equal(loaded?.status, "Confirmed");
  });

  it("findConflicts detects overlaps and supports excludeBookingId", async () => {
    const repo = createInMemoryBookingRepository();
    await repo.create(sampleBooking({ status: "Confirmed" }));

    const conflicts = await repo.findConflicts({
      resourceId: "resource-1",
      range: {
        startsAt: "2026-08-02T10:30:00.000Z",
        endsAt: "2026-08-02T11:30:00.000Z",
      },
    });
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0]?.id, "booking-1");

    const none = await repo.findConflicts({
      resourceId: "resource-1",
      range: {
        startsAt: "2026-08-02T10:30:00.000Z",
        endsAt: "2026-08-02T11:30:00.000Z",
      },
      excludeBookingId: "booking-1",
    });
    assert.equal(none.length, 0);
  });
});

describe("InMemory BookingService via repository", () => {
  it("create / confirm / cancel emit domain events", async () => {
    const booking = createBookingService(createInMemoryBookingRepository());
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });
    assert.equal(
      created.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingCreated,
    );

    const confirmed = await booking.confirm({
      bookingId: created.booking.id,
    });
    assert.equal(
      confirmed.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingConfirmed,
    );

    const cancelled = await booking.cancel({
      bookingId: created.booking.id,
    });
    assert.equal(
      cancelled.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingCancelled,
    );
  });

  it("reschedule / availability / expire hold keep prior behavior", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);

    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });

    const free = await booking.checkAvailability({
      resourceId: "resource-1",
      startsAt: "2026-08-02T12:00:00.000Z",
      endsAt: "2026-08-02T13:00:00.000Z",
    });
    assert.equal(free.available, true);

    const busy = await booking.checkAvailability({
      resourceId: "resource-1",
      startsAt: "2026-08-02T10:30:00.000Z",
      endsAt: "2026-08-02T11:30:00.000Z",
    });
    assert.equal(busy.available, false);

    const rescheduled = await booking.reschedule({
      bookingId: created.booking.id,
      startsAt: "2026-08-02T14:00:00.000Z",
      endsAt: "2026-08-02T15:00:00.000Z",
    });
    assert.equal(
      rescheduled.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingRescheduled,
    );

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
      expired.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingHoldExpired,
    );
  });
});
