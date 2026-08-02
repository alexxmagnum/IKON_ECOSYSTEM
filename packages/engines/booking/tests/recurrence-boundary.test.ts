/**
 * Booking Recurrence Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_RECURRENCE_KINDS,
  BOOKING_RECURRENCE_STATUSES,
  createBookingRecurrence,
  isBookingRecurrence,
  isBookingRecurrenceKind,
  isBookingRecurrenceStatus,
  resetBookingRecurrenceReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Recurrence Boundary", () => {
  beforeEach(() => {
    resetBookingRecurrenceReferenceSequence();
  });

  it("creates Recurrence Boundary context", () => {
    const recurrence = createBookingRecurrence({
      tenantReference: "tenant-a",
      recurrenceKind: BOOKING_RECURRENCE_KINDS.Weekly,
      actorReference: "actor-1",
      patternReference: "pattern-1",
      startReference: "start-1",
      endReference: "end-1",
    });
    assert.equal(isBookingRecurrence(recurrence), true);
    assert.equal(recurrence.recurrenceReference, "recurrence-1");
    assert.equal(recurrence.recurrenceStatus, "draft");
    assert.equal(recurrence.recurrenceKind, "booking.weekly");
    assert.equal(recurrence.bookingReference, undefined);
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingRecurrence({
          tenantReference: "  ",
          recurrenceKind: BOOKING_RECURRENCE_KINDS.Daily,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingRecurrence(
          {
            tenantReference: "tenant-b",
            recurrenceKind: BOOKING_RECURRENCE_KINDS.Monthly,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("allows recurrence without bookingReference", () => {
    const recurrence = createBookingRecurrence({
      tenantReference: "tenant-a",
      recurrenceKind: BOOKING_RECURRENCE_KINDS.Custom,
    });
    assert.equal(isBookingRecurrence(recurrence), true);
    assert.equal(recurrence.bookingReference, undefined);

    assert.throws(
      () =>
        createBookingRecurrence({
          tenantReference: "tenant-a",
          recurrenceKind: BOOKING_RECURRENCE_KINDS.Operational,
          bookingReference: "  ",
        }),
      /bookingReference must not be empty when provided/,
    );
  });

  it("accepts only known recurrence kinds and statuses", () => {
    assert.equal(isBookingRecurrenceKind("booking.weekly"), true);
    assert.equal(isBookingRecurrenceKind("booking.daily"), true);
    assert.equal(isBookingRecurrenceKind("booking.monthly"), true);
    assert.equal(isBookingRecurrenceKind("booking.custom"), true);
    assert.equal(isBookingRecurrenceKind("booking.operational"), true);
    assert.equal(isBookingRecurrenceKind("booking.unknown"), false);

    assert.equal(isBookingRecurrenceStatus("draft"), true);
    assert.equal(isBookingRecurrenceStatus("active"), true);
    assert.equal(isBookingRecurrenceStatus("paused"), true);
    assert.equal(isBookingRecurrenceStatus("completed"), true);
    assert.equal(isBookingRecurrenceStatus("cancelled"), true);
    assert.equal(isBookingRecurrenceStatus("expired"), true);
    assert.equal(isBookingRecurrenceStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingRecurrence({
          tenantReference: "tenant-a",
          recurrenceKind: "booking.unknown" as never,
        }),
      /Unknown booking recurrence kind/,
    );

    const active = createBookingRecurrence({
      tenantReference: "tenant-a",
      recurrenceKind: BOOKING_RECURRENCE_KINDS.Weekly,
      recurrenceStatus: BOOKING_RECURRENCE_STATUSES.Active,
      bookingReference: "bk-1",
    });
    assert.equal(active.recurrenceStatus, "active");
    assert.equal(active.bookingReference, "bk-1");
  });

  it("stays separated from Booking creation / Calendar / Availability / Payment / Subscription", () => {
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

    const recurrence = createBookingRecurrence({
      tenantReference: "tenant-a",
      recurrenceKind: BOOKING_RECURRENCE_KINDS.Daily,
      recurrenceStatus: BOOKING_RECURRENCE_STATUSES.Paused,
    });
    assert.equal(recurrence.recurrenceStatus, "paused");
    assert.equal(isBookingRecurrence(recurrence), true);
  });
});
