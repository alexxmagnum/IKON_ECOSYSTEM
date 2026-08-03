/**
 * BookingRepository contract + InMemory adapter tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Booking } from "../src/index.js";
import {
  BOOKING_DOMAIN_EVENT_TYPES,
  createBookingQueryService,
  createBookingService,
  createBookingTenantContext,
  createInMemoryBookingRepository,
  patchInMemoryHoldExpiresAt,
} from "../src/index.js";

const TENANT = "tenant-1";

function sampleBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: "booking-1",
    tenantReference: TENANT,
    resourceId: "resource-1",
    ownerUserId: "customer-1",
    startsAt: "2026-08-02T10:00:00.000Z",
    endsAt: "2026-08-02T11:00:00.000Z",
    status: "Draft",
    holdExpiresAt: "2026-08-02T10:15:00.000Z",
    ...overrides,
  };
}

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

describe("BookingRepository contract (InMemory)", () => {
  it("create stores and returns booking", async () => {
    const repo = createInMemoryBookingRepository();
    const tenant = createBookingTenantContext(TENANT);
    const created = await repo.create(tenant, sampleBooking());
    assert.equal(created.id, "booking-1");
    assert.equal(created.status, "Draft");
  });

  it("getById returns booking or null", async () => {
    const repo = createInMemoryBookingRepository();
    const tenant = createBookingTenantContext(TENANT);
    await repo.create(tenant, sampleBooking());
    const found = await repo.getById(tenant, "booking-1");
    assert.ok(found);
    assert.equal(found.resourceId, "resource-1");
    assert.equal(await repo.getById(tenant, "missing"), null);
  });

  it("list supports resourceId, ownerUserId, status, range filters", async () => {
    const repo = createInMemoryBookingRepository();
    const tenant = createBookingTenantContext(TENANT);
    await repo.create(tenant, sampleBooking());
    await repo.create(
      tenant,
      sampleBooking({
        id: "booking-2",
        resourceId: "resource-2",
        ownerUserId: "customer-2",
        status: "Confirmed",
        startsAt: "2026-08-02T12:00:00.000Z",
        endsAt: "2026-08-02T13:00:00.000Z",
      }),
    );

    assert.equal((await repo.list(tenant, { resourceId: "resource-1" })).length, 1);
    assert.equal((await repo.list(tenant, { ownerUserId: "customer-2" })).length, 1);
    assert.equal((await repo.list(tenant, { status: "Confirmed" })).length, 1);
    assert.equal(
      (
        await repo.list(tenant, {
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
    const tenant = createBookingTenantContext(TENANT);
    await repo.create(tenant, sampleBooking());
    const updated = await repo.update(
      tenant,
      sampleBooking({ status: "Confirmed", holdExpiresAt: undefined }),
    );
    assert.equal(updated.status, "Confirmed");
    const loaded = await repo.getById(tenant, "booking-1");
    assert.equal(loaded?.status, "Confirmed");
  });

  it("findConflicts detects overlaps and supports excludeBookingId", async () => {
    const repo = createInMemoryBookingRepository();
    const tenant = createBookingTenantContext(TENANT);
    await repo.create(tenant, sampleBooking({ status: "Confirmed" }));

    const conflicts = await repo.findConflicts(tenant, {
      resourceId: "resource-1",
      range: {
        startsAt: "2026-08-02T10:30:00.000Z",
        endsAt: "2026-08-02T11:30:00.000Z",
      },
    });
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0]?.id, "booking-1");

    const none = await repo.findConflicts(tenant, {
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
    const created = await booking.create(createInput());
    assert.equal(
      created.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingCreated,
    );

    const confirmed = await booking.confirm({
      tenantReference: TENANT,
      bookingId: created.booking.id,
    });
    assert.equal(
      confirmed.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingConfirmed,
    );

    const cancelled = await booking.cancel({
      tenantReference: TENANT,
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
    const tenant = createBookingTenantContext(TENANT);

    const created = await booking.create(createInput());

    const free = await createBookingQueryService(repository).checkAvailability({
      tenantReference: TENANT,
      resourceId: "resource-1",
      startsAt: "2026-08-02T12:00:00.000Z",
      endsAt: "2026-08-02T13:00:00.000Z",
    });
    assert.equal(free.available, true);

    const busy = await createBookingQueryService(repository).checkAvailability({
      tenantReference: TENANT,
      resourceId: "resource-1",
      startsAt: "2026-08-02T10:30:00.000Z",
      endsAt: "2026-08-02T11:30:00.000Z",
    });
    assert.equal(busy.available, false);

    const rescheduled = await booking.reschedule({
      tenantReference: TENANT,
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
      tenant,
      created.booking.id,
      "2020-01-01T00:00:00.000Z",
    );
    const expired = await booking.expireHolds({
      tenantReference: TENANT,
      now: "2026-08-02T12:00:00.000Z",
    });
    assert.equal(expired.expiredBookingIds.length, 1);
    assert.equal(
      expired.events?.[0]?.eventType,
      BOOKING_DOMAIN_EVENT_TYPES.BookingHoldExpired,
    );
  });
});
