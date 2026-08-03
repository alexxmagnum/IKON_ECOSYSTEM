/**
 * Booking Check-in Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_CHECK_IN_KINDS,
  BOOKING_CHECK_IN_STATUSES,
  createBookingCheckIn,
  isBookingCheckIn,
  isBookingCheckInKind,
  isBookingCheckInStatus,
  resetBookingCheckInReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Check-in Boundary", () => {
  beforeEach(() => {
    resetBookingCheckInReferenceSequence();
  });

  it("creates Check-in Boundary context", () => {
    const checkIn = createBookingCheckIn({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      checkInKind: BOOKING_CHECK_IN_KINDS.CustomerArrival,
      actorReference: "actor-1",
      reasonReference: "reason-1",
    });
    assert.equal(isBookingCheckIn(checkIn), true);
    assert.equal(checkIn.checkInReference, "checkin-1");
    assert.equal(checkIn.checkInStatus, "requested");
    assert.equal(checkIn.checkInKind, "booking.customer_arrival");
    assert.equal(checkIn.bookingReference, "bk-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingCheckIn({
          tenantReference: "  ",
          bookingReference: "bk-1",
          checkInKind: BOOKING_CHECK_IN_KINDS.OperatorAssisted,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingCheckIn(
          {
            tenantReference: "tenant-b",
            bookingReference: "bk-1",
            checkInKind: BOOKING_CHECK_IN_KINDS.Manual,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("requires bookingReference", () => {
    assert.throws(
      () =>
        createBookingCheckIn({
          tenantReference: "tenant-a",
          bookingReference: "",
          checkInKind: BOOKING_CHECK_IN_KINDS.PolicyRequired,
        }),
      /bookingReference is required/,
    );

    assert.throws(
      () =>
        createBookingCheckIn({
          tenantReference: "tenant-a",
          bookingReference: "  ",
          checkInKind: BOOKING_CHECK_IN_KINDS.Operational,
        }),
      /bookingReference is required/,
    );
  });

  it("accepts only known check-in kinds and statuses", () => {
    assert.equal(isBookingCheckInKind("booking.customer_arrival"), true);
    assert.equal(isBookingCheckInKind("booking.operator_assisted"), true);
    assert.equal(isBookingCheckInKind("booking.manual"), true);
    assert.equal(isBookingCheckInKind("booking.policy_required"), true);
    assert.equal(isBookingCheckInKind("booking.operational"), true);
    assert.equal(isBookingCheckInKind("booking.unknown"), false);

    assert.equal(isBookingCheckInStatus("requested"), true);
    assert.equal(isBookingCheckInStatus("approved"), true);
    assert.equal(isBookingCheckInStatus("completed"), true);
    assert.equal(isBookingCheckInStatus("rejected"), true);
    assert.equal(isBookingCheckInStatus("cancelled"), true);
    assert.equal(isBookingCheckInStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingCheckIn({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          checkInKind: "booking.unknown" as never,
        }),
      /Unknown booking check-in kind/,
    );

    const completed = createBookingCheckIn({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      checkInKind: BOOKING_CHECK_IN_KINDS.CustomerArrival,
      checkInStatus: BOOKING_CHECK_IN_STATUSES.Completed,
    });
    assert.equal(completed.checkInStatus, "completed");
  });

  it("stays separated from Payment / Resource / Notification / Workflow / Availability", () => {
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

    const checkIn = createBookingCheckIn({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      checkInKind: BOOKING_CHECK_IN_KINDS.OperatorAssisted,
      checkInStatus: BOOKING_CHECK_IN_STATUSES.Approved,
    });
    assert.equal(checkIn.checkInStatus, "approved");
    assert.equal(isBookingCheckIn(checkIn), true);
  });
});
