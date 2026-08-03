/**
 * Booking Availability Policy Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_AVAILABILITY_KINDS,
  availabilityBelongsToTenant,
  createBookingAvailabilityRequest,
  isBookingAvailabilityKind,
  isBookingAvailabilityPort,
  isBookingAvailabilityRequest,
  resetBookingAvailabilityReferenceSequence,
  type BookingAvailabilityPort,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Availability Policy Boundary", () => {
  beforeEach(() => {
    resetBookingAvailabilityReferenceSequence();
  });

  it("creates a valid availability request", () => {
    const request = createBookingAvailabilityRequest({
      tenantReference: "tenant-a",
      resourceReference: "res-1",
      bookingReference: "bk-1",
      actorReference: "actor-1",
      availabilityKind: BOOKING_AVAILABILITY_KINDS.SlotCheck,
      startAt: "2026-08-01T10:00:00.000Z",
      endAt: "2026-08-01T11:00:00.000Z",
      metadata: { correlationId: "corr-1" },
    });

    assert.deepEqual(request, {
      availabilityReference: "availability-1",
      tenantReference: "tenant-a",
      resourceReference: "res-1",
      bookingReference: "bk-1",
      actorReference: "actor-1",
      availabilityKind: "booking.slot_check",
      startAt: "2026-08-01T10:00:00.000Z",
      endAt: "2026-08-01T11:00:00.000Z",
      metadata: { correlationId: "corr-1" },
    });
    assert.equal(isBookingAvailabilityRequest(request), true);
  });

  it("accepts only known availability kinds", () => {
    assert.equal(isBookingAvailabilityKind("booking.resource_check"), true);
    assert.equal(isBookingAvailabilityKind("booking.slot_check"), true);
    assert.equal(isBookingAvailabilityKind("booking.capacity_check"), true);
    assert.equal(isBookingAvailabilityKind("booking.unknown"), false);

    const capacity = createBookingAvailabilityRequest({
      tenantReference: "tenant-a",
      resourceReference: "res-1",
      availabilityKind: BOOKING_AVAILABILITY_KINDS.CapacityCheck,
      startAt: "2026-08-01T10:00:00.000Z",
      endAt: "2026-08-01T11:00:00.000Z",
    });
    assert.equal(capacity.availabilityKind, "booking.capacity_check");

    assert.throws(
      () =>
        createBookingAvailabilityRequest({
          tenantReference: "tenant-a",
          resourceReference: "res-1",
          availabilityKind: "booking.unknown" as never,
          startAt: "2026-08-01T10:00:00.000Z",
          endAt: "2026-08-01T11:00:00.000Z",
        }),
      /Unknown booking availability kind/,
    );
  });

  it("requires tenant, resource, and range references", () => {
    assert.throws(
      () =>
        createBookingAvailabilityRequest({
          tenantReference: "  ",
          resourceReference: "res-1",
          availabilityKind: BOOKING_AVAILABILITY_KINDS.ResourceCheck,
          startAt: "2026-08-01T10:00:00.000Z",
          endAt: "2026-08-01T11:00:00.000Z",
        }),
      /tenantReference is required/,
    );
    assert.throws(
      () =>
        createBookingAvailabilityRequest({
          tenantReference: "tenant-a",
          resourceReference: "",
          availabilityKind: BOOKING_AVAILABILITY_KINDS.ResourceCheck,
          startAt: "2026-08-01T10:00:00.000Z",
          endAt: "2026-08-01T11:00:00.000Z",
        }),
      /resourceReference is required/,
    );
    assert.throws(
      () =>
        createBookingAvailabilityRequest({
          tenantReference: "tenant-a",
          resourceReference: "res-1",
          availabilityKind: BOOKING_AVAILABILITY_KINDS.ResourceCheck,
          startAt: "",
          endAt: "2026-08-01T11:00:00.000Z",
        }),
      /startAt is required/,
    );
  });

  it("isolates availability requests by tenantReference", () => {
    const request = createBookingAvailabilityRequest({
      tenantReference: "tenant-a",
      resourceReference: "res-1",
      availabilityKind: BOOKING_AVAILABILITY_KINDS.ResourceCheck,
      startAt: "2026-08-01T10:00:00.000Z",
      endAt: "2026-08-01T11:00:00.000Z",
    });
    assert.equal(availabilityBelongsToTenant(request, "tenant-a"), true);
    assert.equal(availabilityBelongsToTenant(request, "tenant-b"), false);
    assert.equal(availabilityBelongsToTenant(request, "  "), false);
  });

  it("has no external calendar provider dependencies", () => {
    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(pkg.devDependencies, undefined);

    const port: BookingAvailabilityPort = {
      async checkAvailability() {
        return { available: true };
      },
    };
    assert.equal(isBookingAvailabilityPort(port), true);
  });
});
