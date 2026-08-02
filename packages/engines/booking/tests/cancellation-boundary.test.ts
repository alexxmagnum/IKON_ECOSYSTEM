/**
 * Booking Cancellation Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_CANCELLATION_KINDS,
  BOOKING_CANCELLATION_STATUSES,
  createBookingCancellation,
  isBookingCancellation,
  isBookingCancellationKind,
  isBookingCancellationStatus,
  resetBookingCancellationReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Cancellation Boundary", () => {
  beforeEach(() => {
    resetBookingCancellationReferenceSequence();
  });

  it("creates Cancellation Boundary context", () => {
    const cancellation = createBookingCancellation({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      cancellationKind: BOOKING_CANCELLATION_KINDS.CustomerRequested,
      actorReference: "actor-1",
      reasonReference: "reason-1",
    });
    assert.equal(isBookingCancellation(cancellation), true);
    assert.equal(cancellation.cancellationReference, "cancellation-1");
    assert.equal(cancellation.cancellationStatus, "requested");
    assert.equal(cancellation.cancellationKind, "booking.customer_requested");
    assert.equal(cancellation.bookingReference, "bk-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingCancellation({
          tenantReference: "  ",
          bookingReference: "bk-1",
          cancellationKind: BOOKING_CANCELLATION_KINDS.OperatorRequested,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingCancellation(
          {
            tenantReference: "tenant-b",
            bookingReference: "bk-1",
            cancellationKind: BOOKING_CANCELLATION_KINDS.PolicyRequired,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("requires bookingReference", () => {
    assert.throws(
      () =>
        createBookingCancellation({
          tenantReference: "tenant-a",
          bookingReference: "",
          cancellationKind: BOOKING_CANCELLATION_KINDS.ExceptionBased,
        }),
      /bookingReference is required/,
    );

    assert.throws(
      () =>
        createBookingCancellation({
          tenantReference: "tenant-a",
          bookingReference: "  ",
          cancellationKind: BOOKING_CANCELLATION_KINDS.Operational,
        }),
      /bookingReference is required/,
    );
  });

  it("accepts only known cancellation kinds and statuses", () => {
    assert.equal(isBookingCancellationKind("booking.customer_requested"), true);
    assert.equal(isBookingCancellationKind("booking.operator_requested"), true);
    assert.equal(isBookingCancellationKind("booking.policy_required"), true);
    assert.equal(isBookingCancellationKind("booking.exception_based"), true);
    assert.equal(isBookingCancellationKind("booking.operational"), true);
    assert.equal(isBookingCancellationKind("booking.unknown"), false);

    assert.equal(isBookingCancellationStatus("requested"), true);
    assert.equal(isBookingCancellationStatus("approved"), true);
    assert.equal(isBookingCancellationStatus("rejected"), true);
    assert.equal(isBookingCancellationStatus("completed"), true);
    assert.equal(isBookingCancellationStatus("cancelled"), true);
    assert.equal(isBookingCancellationStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingCancellation({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          cancellationKind: "booking.unknown" as never,
        }),
      /Unknown booking cancellation kind/,
    );

    const completed = createBookingCancellation({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      cancellationKind: BOOKING_CANCELLATION_KINDS.CustomerRequested,
      cancellationStatus: BOOKING_CANCELLATION_STATUSES.Completed,
    });
    assert.equal(completed.cancellationStatus, "completed");
  });

  it("stays separated from Payment / Refund / Notification / Workflow", () => {
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

    const cancellation = createBookingCancellation({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      cancellationKind: BOOKING_CANCELLATION_KINDS.OperatorRequested,
      cancellationStatus: BOOKING_CANCELLATION_STATUSES.Approved,
    });
    assert.equal(cancellation.cancellationStatus, "approved");
    assert.equal(isBookingCancellation(cancellation), true);
  });
});
