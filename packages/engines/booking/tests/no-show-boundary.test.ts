/**
 * Booking No-Show Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_NO_SHOW_KINDS,
  BOOKING_NO_SHOW_STATUSES,
  createBookingNoShow,
  isBookingNoShow,
  isBookingNoShowKind,
  isBookingNoShowStatus,
  resetBookingNoShowReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking No-Show Boundary", () => {
  beforeEach(() => {
    resetBookingNoShowReferenceSequence();
  });

  it("creates No-Show Boundary context", () => {
    const noShow = createBookingNoShow({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      noShowKind: BOOKING_NO_SHOW_KINDS.CustomerAbsent,
      actorReference: "actor-1",
      reasonReference: "reason-1",
    });
    assert.equal(isBookingNoShow(noShow), true);
    assert.equal(noShow.noShowReference, "noshow-1");
    assert.equal(noShow.noShowStatus, "detected");
    assert.equal(noShow.noShowKind, "booking.customer_absent");
    assert.equal(noShow.bookingReference, "bk-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingNoShow({
          tenantReference: "  ",
          bookingReference: "bk-1",
          noShowKind: BOOKING_NO_SHOW_KINDS.OperatorMarked,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingNoShow(
          {
            tenantReference: "tenant-b",
            bookingReference: "bk-1",
            noShowKind: BOOKING_NO_SHOW_KINDS.PolicyRequired,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("requires bookingReference", () => {
    assert.throws(
      () =>
        createBookingNoShow({
          tenantReference: "tenant-a",
          bookingReference: "",
          noShowKind: BOOKING_NO_SHOW_KINDS.Operational,
        }),
      /bookingReference is required/,
    );

    assert.throws(
      () =>
        createBookingNoShow({
          tenantReference: "tenant-a",
          bookingReference: "  ",
          noShowKind: BOOKING_NO_SHOW_KINDS.ManualReview,
        }),
      /bookingReference is required/,
    );
  });

  it("accepts only known no-show kinds and statuses", () => {
    assert.equal(isBookingNoShowKind("booking.customer_absent"), true);
    assert.equal(isBookingNoShowKind("booking.operator_marked"), true);
    assert.equal(isBookingNoShowKind("booking.policy_required"), true);
    assert.equal(isBookingNoShowKind("booking.operational"), true);
    assert.equal(isBookingNoShowKind("booking.manual_review"), true);
    assert.equal(isBookingNoShowKind("booking.unknown"), false);

    assert.equal(isBookingNoShowStatus("detected"), true);
    assert.equal(isBookingNoShowStatus("review_pending"), true);
    assert.equal(isBookingNoShowStatus("confirmed"), true);
    assert.equal(isBookingNoShowStatus("rejected"), true);
    assert.equal(isBookingNoShowStatus("cancelled"), true);
    assert.equal(isBookingNoShowStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingNoShow({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          noShowKind: "booking.unknown" as never,
        }),
      /Unknown booking no-show kind/,
    );

    const confirmed = createBookingNoShow({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      noShowKind: BOOKING_NO_SHOW_KINDS.CustomerAbsent,
      noShowStatus: BOOKING_NO_SHOW_STATUSES.Confirmed,
    });
    assert.equal(confirmed.noShowStatus, "confirmed");
  });

  it("stays separated from Cancellation / Check-in / Payment / Fee / Resource / Notification / Workflow", () => {
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

    const noShow = createBookingNoShow({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      noShowKind: BOOKING_NO_SHOW_KINDS.OperatorMarked,
      noShowStatus: BOOKING_NO_SHOW_STATUSES.ReviewPending,
    });
    assert.equal(noShow.noShowStatus, "review_pending");
    assert.equal(isBookingNoShow(noShow), true);
  });
});
