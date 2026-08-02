/**
 * Booking query boundary tests — reads only, no mutations/events.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createBookingQueryService,
  createBookingService,
  createInMemoryBookingRepository,
} from "../src/index.js";

describe("BookingQueryService boundary", () => {
  it("getBooking returns stored aggregate or null", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const queries = createBookingQueryService(repository);

    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });

    const found = await queries.getBooking(created.booking.id);
    assert.ok(found);
    assert.equal(found.id, created.booking.id);
    assert.equal(await queries.getBooking("missing"), null);
  });

  it("listBookings applies existing filters", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const queries = createBookingQueryService(repository);

    await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });
    await booking.create({
      resourceId: "resource-2",
      ownerUserId: "customer-2",
      startsAt: "2026-08-02T12:00:00.000Z",
      endsAt: "2026-08-02T13:00:00.000Z",
    });

    const byResource = await queries.listBookings({
      resourceId: "resource-1",
    });
    assert.equal(byResource.length, 1);
    assert.equal(byResource[0]?.ownerUserId, "customer-1");
  });

  it("checkAvailability is read-only", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const queries = createBookingQueryService(repository);

    await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });

    const before = await repository.list({});
    const result = await queries.checkAvailability({
      resourceId: "resource-1",
      startsAt: "2026-08-02T10:30:00.000Z",
      endsAt: "2026-08-02T11:30:00.000Z",
    });
    assert.equal(result.available, false);

    const after = await repository.list({});
    assert.equal(after.length, before.length);
    assert.equal(after[0]?.status, before[0]?.status);
    assert.equal(after[0]?.startsAt, before[0]?.startsAt);
  });

  it("query methods do not attach domain events", async () => {
    const repository = createInMemoryBookingRepository();
    const booking = createBookingService(repository);
    const queries = createBookingQueryService(repository);
    const created = await booking.create({
      resourceId: "resource-1",
      ownerUserId: "customer-1",
      startsAt: "2026-08-02T10:00:00.000Z",
      endsAt: "2026-08-02T11:00:00.000Z",
    });

    const got = await queries.getBooking(created.booking.id);
    const listed = await queries.listBookings({});
    const availability = await queries.checkAvailability({
      resourceId: "resource-1",
      startsAt: "2026-08-02T12:00:00.000Z",
      endsAt: "2026-08-02T13:00:00.000Z",
    });

    assert.ok(got);
    assert.equal("events" in (got as object), false);
    assert.equal(Array.isArray(listed), true);
    assert.equal("events" in availability, false);
  });
});
