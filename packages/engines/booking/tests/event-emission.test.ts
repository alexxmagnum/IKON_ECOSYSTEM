/**
 * Booking domain event emission tests (engine helpers + mutation results).
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOOKING_DOMAIN_EVENT_TYPES,
  createBookingService,
  createBookingTenantContext,
  createInMemoryBookingRepository,
  patchInMemoryHoldExpiresAt,
} from "../src/index.js";

const TENANT = "tenant-1";

function createInput(overrides: Record<string, string> = {}) {
  return {
    tenantReference: TENANT,
    resourceId: "resource-1",
    ownerUserId: "customer-1",
    startsAt: "2026-08-02T10:00:00.000Z",
    endsAt: "2026-08-02T11:00:00.000Z",
    ...overrides,
  };
}

function createEmittingBooking() {
  const repository = createInMemoryBookingRepository();
  return {
    repository,
    booking: createBookingService(repository),
  };
}

describe("Booking event emission", () => {
  it("Create produces BookingCreatedEvent", async () => {
    const { booking } = createEmittingBooking();
    const result = await booking.create(createInput());
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
    const { booking } = createEmittingBooking();
    const created = await booking.create(createInput());
    const confirmed = await booking.confirm({
      tenantReference: TENANT,
      bookingId: created.booking.id,
    });
    assert.equal(
      confirmed.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingConfirmed,
    );
  });

  it("Cancel produces BookingCancelledEvent", async () => {
    const { booking } = createEmittingBooking();
    const created = await booking.create(createInput());
    const cancelled = await booking.cancel({
      tenantReference: TENANT,
      bookingId: created.booking.id,
    });
    assert.equal(
      cancelled.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingCancelled,
    );
  });

  it("Reschedule produces BookingRescheduledEvent", async () => {
    const { booking } = createEmittingBooking();
    const created = await booking.create(createInput());
    const rescheduled = await booking.reschedule({
      tenantReference: TENANT,
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
    const { booking, repository } = createEmittingBooking();
    const tenant = createBookingTenantContext(TENANT);
    const created = await booking.create(createInput());
    await patchInMemoryHoldExpiresAt(
      repository,
      tenant,
      created.booking.id,
      "2020-01-01T00:00:00.000Z",
    );

    const expired = await booking.expireHolds({
      tenantReference: TENANT,
      now: "2026-08-02T12:00:00.000Z",
    });
    assert.equal(expired.events?.length, 1);
    assert.equal(
      expired.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingHoldExpired,
    );
  });
});
