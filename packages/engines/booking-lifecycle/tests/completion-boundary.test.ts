/**
 * Booking Completion Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_COMPLETION_KINDS,
  BOOKING_COMPLETION_STATUSES,
  createBookingCompletion,
  isBookingCompletion,
  isBookingCompletionKind,
  isBookingCompletionStatus,
  resetBookingCompletionReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Completion Boundary", () => {
  beforeEach(() => {
    resetBookingCompletionReferenceSequence();
  });

  it("creates Completion Boundary context", () => {
    const completion = createBookingCompletion({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      completionKind: BOOKING_COMPLETION_KINDS.ServiceCompleted,
      actorReference: "actor-1",
      reasonReference: "reason-1",
    });
    assert.equal(isBookingCompletion(completion), true);
    assert.equal(completion.completionReference, "completion-1");
    assert.equal(completion.completionStatus, "requested");
    assert.equal(completion.completionKind, "booking.service_completed");
    assert.equal(completion.bookingReference, "bk-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingCompletion({
          tenantReference: "  ",
          bookingReference: "bk-1",
          completionKind: BOOKING_COMPLETION_KINDS.CustomerCompleted,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingCompletion(
          {
            tenantReference: "tenant-b",
            bookingReference: "bk-1",
            completionKind: BOOKING_COMPLETION_KINDS.OperatorCompleted,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("requires bookingReference", () => {
    assert.throws(
      () =>
        createBookingCompletion({
          tenantReference: "tenant-a",
          bookingReference: "",
          completionKind: BOOKING_COMPLETION_KINDS.ManualReview,
        }),
      /bookingReference is required/,
    );

    assert.throws(
      () =>
        createBookingCompletion({
          tenantReference: "tenant-a",
          bookingReference: "  ",
          completionKind: BOOKING_COMPLETION_KINDS.Operational,
        }),
      /bookingReference is required/,
    );
  });

  it("accepts only known completion kinds and statuses", () => {
    assert.equal(isBookingCompletionKind("booking.service_completed"), true);
    assert.equal(isBookingCompletionKind("booking.customer_completed"), true);
    assert.equal(isBookingCompletionKind("booking.operator_completed"), true);
    assert.equal(isBookingCompletionKind("booking.manual_review"), true);
    assert.equal(isBookingCompletionKind("booking.operational"), true);
    assert.equal(isBookingCompletionKind("booking.unknown"), false);

    assert.equal(isBookingCompletionStatus("requested"), true);
    assert.equal(isBookingCompletionStatus("approved"), true);
    assert.equal(isBookingCompletionStatus("completed"), true);
    assert.equal(isBookingCompletionStatus("rejected"), true);
    assert.equal(isBookingCompletionStatus("cancelled"), true);
    assert.equal(isBookingCompletionStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingCompletion({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          completionKind: "booking.unknown" as never,
        }),
      /Unknown booking completion kind/,
    );

    const completed = createBookingCompletion({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      completionKind: BOOKING_COMPLETION_KINDS.ServiceCompleted,
      completionStatus: BOOKING_COMPLETION_STATUSES.Completed,
    });
    assert.equal(completed.completionStatus, "completed");
  });

  it("stays separated from Check-in / No-show / Payment / Settlement / Invoice / Resource / Notification / Workflow", () => {
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

    const completion = createBookingCompletion({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      completionKind: BOOKING_COMPLETION_KINDS.OperatorCompleted,
      completionStatus: BOOKING_COMPLETION_STATUSES.Approved,
    });
    assert.equal(completion.completionStatus, "approved");
    assert.equal(isBookingCompletion(completion), true);
  });
});
