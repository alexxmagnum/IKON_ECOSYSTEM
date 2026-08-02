/**
 * Booking Waitlist Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_WAITLIST_KINDS,
  BOOKING_WAITLIST_STATUSES,
  createBookingWaitlist,
  isBookingWaitlist,
  isBookingWaitlistKind,
  isBookingWaitlistStatus,
  resetBookingWaitlistReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Waitlist Boundary", () => {
  beforeEach(() => {
    resetBookingWaitlistReferenceSequence();
  });

  it("creates Waitlist Boundary context", () => {
    const waitlist = createBookingWaitlist({
      tenantReference: "tenant-a",
      waitlistKind: BOOKING_WAITLIST_KINDS.CustomerRequested,
      actorReference: "actor-1",
      availabilityReference: "avail-1",
      requestedDateReference: "date-1",
    });
    assert.equal(isBookingWaitlist(waitlist), true);
    assert.equal(waitlist.waitlistReference, "waitlist-1");
    assert.equal(waitlist.waitlistStatus, "waiting");
    assert.equal(waitlist.waitlistKind, "booking.customer_requested");
    assert.equal(waitlist.bookingReference, undefined);
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingWaitlist({
          tenantReference: "  ",
          waitlistKind: BOOKING_WAITLIST_KINDS.OperatorCreated,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingWaitlist(
          {
            tenantReference: "tenant-b",
            waitlistKind: BOOKING_WAITLIST_KINDS.AvailabilityRequired,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("allows waitlist without bookingReference", () => {
    const waitlist = createBookingWaitlist({
      tenantReference: "tenant-a",
      waitlistKind: BOOKING_WAITLIST_KINDS.CapacityRequired,
    });
    assert.equal(isBookingWaitlist(waitlist), true);
    assert.equal(waitlist.bookingReference, undefined);

    assert.throws(
      () =>
        createBookingWaitlist({
          tenantReference: "tenant-a",
          waitlistKind: BOOKING_WAITLIST_KINDS.Operational,
          bookingReference: "  ",
        }),
      /bookingReference must not be empty when provided/,
    );
  });

  it("accepts only known waitlist kinds and statuses", () => {
    assert.equal(isBookingWaitlistKind("booking.customer_requested"), true);
    assert.equal(isBookingWaitlistKind("booking.operator_created"), true);
    assert.equal(isBookingWaitlistKind("booking.availability_required"), true);
    assert.equal(isBookingWaitlistKind("booking.capacity_required"), true);
    assert.equal(isBookingWaitlistKind("booking.operational"), true);
    assert.equal(isBookingWaitlistKind("booking.unknown"), false);

    assert.equal(isBookingWaitlistStatus("waiting"), true);
    assert.equal(isBookingWaitlistStatus("notified"), true);
    assert.equal(isBookingWaitlistStatus("accepted"), true);
    assert.equal(isBookingWaitlistStatus("converted"), true);
    assert.equal(isBookingWaitlistStatus("expired"), true);
    assert.equal(isBookingWaitlistStatus("cancelled"), true);
    assert.equal(isBookingWaitlistStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingWaitlist({
          tenantReference: "tenant-a",
          waitlistKind: "booking.unknown" as never,
        }),
      /Unknown booking waitlist kind/,
    );

    const converted = createBookingWaitlist({
      tenantReference: "tenant-a",
      waitlistKind: BOOKING_WAITLIST_KINDS.CustomerRequested,
      waitlistStatus: BOOKING_WAITLIST_STATUSES.Converted,
      bookingReference: "bk-1",
    });
    assert.equal(converted.waitlistStatus, "converted");
    assert.equal(converted.bookingReference, "bk-1");
  });

  it("stays separated from Booking / Availability / Payment / Notification / Resource", () => {
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

    const waitlist = createBookingWaitlist({
      tenantReference: "tenant-a",
      waitlistKind: BOOKING_WAITLIST_KINDS.OperatorCreated,
      waitlistStatus: BOOKING_WAITLIST_STATUSES.Notified,
    });
    assert.equal(waitlist.waitlistStatus, "notified");
    assert.equal(isBookingWaitlist(waitlist), true);
  });
});
