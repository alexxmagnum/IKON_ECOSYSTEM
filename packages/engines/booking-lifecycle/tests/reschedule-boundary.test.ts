/**
 * Booking Reschedule Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_RESCHEDULE_KINDS,
  BOOKING_RESCHEDULE_STATUSES,
  createBookingReschedule,
  isBookingReschedule,
  isBookingRescheduleKind,
  isBookingRescheduleStatus,
  resetBookingRescheduleReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Reschedule Boundary", () => {
  beforeEach(() => {
    resetBookingRescheduleReferenceSequence();
  });

  it("creates Reschedule Boundary context", () => {
    const reschedule = createBookingReschedule({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      rescheduleKind: BOOKING_RESCHEDULE_KINDS.CustomerRequested,
      currentStartReference: "start-current-1",
      requestedStartReference: "start-requested-1",
      actorReference: "actor-1",
      reasonReference: "reason-1",
    });
    assert.equal(isBookingReschedule(reschedule), true);
    assert.equal(reschedule.rescheduleReference, "reschedule-1");
    assert.equal(reschedule.rescheduleStatus, "requested");
    assert.equal(reschedule.rescheduleKind, "booking.customer_requested");
    assert.equal(reschedule.bookingReference, "bk-1");
    assert.equal(reschedule.currentStartReference, "start-current-1");
    assert.equal(reschedule.requestedStartReference, "start-requested-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingReschedule({
          tenantReference: "  ",
          bookingReference: "bk-1",
          rescheduleKind: BOOKING_RESCHEDULE_KINDS.OperatorRequested,
          currentStartReference: "start-a",
          requestedStartReference: "start-b",
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingReschedule(
          {
            tenantReference: "tenant-b",
            bookingReference: "bk-1",
            rescheduleKind: BOOKING_RESCHEDULE_KINDS.PolicyRequired,
            currentStartReference: "start-a",
            requestedStartReference: "start-b",
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("requires bookingReference", () => {
    assert.throws(
      () =>
        createBookingReschedule({
          tenantReference: "tenant-a",
          bookingReference: "",
          rescheduleKind: BOOKING_RESCHEDULE_KINDS.AvailabilityRequired,
          currentStartReference: "start-a",
          requestedStartReference: "start-b",
        }),
      /bookingReference is required/,
    );

    assert.throws(
      () =>
        createBookingReschedule({
          tenantReference: "tenant-a",
          bookingReference: "  ",
          rescheduleKind: BOOKING_RESCHEDULE_KINDS.Operational,
          currentStartReference: "start-a",
          requestedStartReference: "start-b",
        }),
      /bookingReference is required/,
    );
  });

  it("accepts only known reschedule kinds and statuses", () => {
    assert.equal(isBookingRescheduleKind("booking.customer_requested"), true);
    assert.equal(isBookingRescheduleKind("booking.operator_requested"), true);
    assert.equal(
      isBookingRescheduleKind("booking.availability_required"),
      true,
    );
    assert.equal(isBookingRescheduleKind("booking.policy_required"), true);
    assert.equal(isBookingRescheduleKind("booking.operational"), true);
    assert.equal(isBookingRescheduleKind("booking.unknown"), false);

    assert.equal(isBookingRescheduleStatus("requested"), true);
    assert.equal(isBookingRescheduleStatus("approved"), true);
    assert.equal(isBookingRescheduleStatus("rejected"), true);
    assert.equal(isBookingRescheduleStatus("completed"), true);
    assert.equal(isBookingRescheduleStatus("cancelled"), true);
    assert.equal(isBookingRescheduleStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingReschedule({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          rescheduleKind: "booking.unknown" as never,
          currentStartReference: "start-a",
          requestedStartReference: "start-b",
        }),
      /Unknown booking reschedule kind/,
    );

    const completed = createBookingReschedule({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      rescheduleKind: BOOKING_RESCHEDULE_KINDS.CustomerRequested,
      currentStartReference: "start-a",
      requestedStartReference: "start-b",
      rescheduleStatus: BOOKING_RESCHEDULE_STATUSES.Completed,
    });
    assert.equal(completed.rescheduleStatus, "completed");
  });

  it("stays separated from Payment / Pricing / Availability / Notification / Workflow", () => {
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

    const reschedule = createBookingReschedule({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      rescheduleKind: BOOKING_RESCHEDULE_KINDS.OperatorRequested,
      currentStartReference: "start-a",
      requestedStartReference: "start-b",
      rescheduleStatus: BOOKING_RESCHEDULE_STATUSES.Approved,
    });
    assert.equal(reschedule.rescheduleStatus, "approved");
    assert.equal(isBookingReschedule(reschedule), true);
  });
});
