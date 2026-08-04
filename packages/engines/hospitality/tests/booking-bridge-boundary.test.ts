/**
 * Hospitality Booking Bridge contract tests.
 * Run: pnpm --filter @motanos/hospitality test
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_KINDS,
  BOOKING_STATUSES,
  createBookingRequest,
  isBookingKind,
  isBookingStatus,
  isHospitalityBookingRequest,
  resetBookingReferenceSequence,
} from "../src/public.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const bookingBridgeRoot = join(packageRoot, "src", "booking-bridge");
const hospitalityBusiness = "hospitality-ikon";
const otherHospitalityBusiness = "hospitality-marina";

describe("Hospitality Booking Bridge Boundary", () => {
  beforeEach(() => {
    resetBookingReferenceSequence();
  });

  it("creates BookingRequest", () => {
    const booking = createBookingRequest({
      bookingKind: BOOKING_KINDS.Activity,
      hospitalityReference: hospitalityBusiness,
      activityReference: "activity-1",
      scheduleReference: "schedule-1",
      availabilityReference: "availability-1",
      participationReference: "participation-1",
      actorReference: "actor-1",
      contextReference: "context-1",
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isHospitalityBookingRequest(booking), true);
    assert.equal(booking.bookingReference, "booking-1");
    assert.equal(booking.bookingStatus, "draft");
    assert.equal(booking.bookingKind, "booking.activity");
    assert.equal(booking.hospitalityReference, hospitalityBusiness);
    assert.equal(booking.availabilityReference, "availability-1");
    assert.equal(booking.participationReference, "participation-1");
    assert.equal(
      Object.prototype.hasOwnProperty.call(booking, "numberOfGuests"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(booking, "price"),
      false,
    );
  });

  it("checks hospitality business isolation", () => {
    assert.throws(
      () =>
        createBookingRequest({
          bookingKind: BOOKING_KINDS.Event,
          hospitalityReference: "  ",
        }),
      /hospitalityReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createBookingRequest(
          {
            bookingKind: BOOKING_KINDS.Session,
            hospitalityReference: otherHospitalityBusiness,
          },
          { hospitalityReference: hospitalityBusiness },
        ),
      /does not apply to this hospitality business/,
    );

    assert.throws(
      () =>
        createBookingRequest({
          bookingKind: BOOKING_KINDS.Internal,
          participationReference: "  ",
        }),
      /participationReference must not be empty when provided/,
    );
  });

  it("accepts only known booking kinds", () => {
    assert.equal(isBookingKind("booking.activity"), true);
    assert.equal(isBookingKind("booking.event"), true);
    assert.equal(isBookingKind("booking.session"), true);
    assert.equal(isBookingKind("booking.internal"), true);
    assert.equal(isBookingKind("ticket"), false);
    assert.equal(isBookingKind("hold"), false);
    assert.equal(isBookingKind("invoice"), false);

    assert.throws(
      () =>
        createBookingRequest({
          bookingKind: "booking.unknown" as never,
        }),
      /Unknown booking kind/,
    );

    assert.throws(
      () =>
        createBookingRequest({
          bookingKind: "ticket" as never,
        }),
      /Unknown booking kind/,
    );
  });

  it("accepts only known booking statuses", () => {
    assert.equal(isBookingStatus("draft"), true);
    assert.equal(isBookingStatus("requested"), true);
    assert.equal(isBookingStatus("pending"), true);
    assert.equal(isBookingStatus("accepted"), true);
    assert.equal(isBookingStatus("rejected"), true);
    assert.equal(isBookingStatus("cancelled"), true);
    assert.equal(isBookingStatus("archived"), true);
    assert.equal(isBookingStatus("unknown"), false);
    assert.equal(isBookingStatus("paid"), false);

    const requested = createBookingRequest({
      bookingKind: BOOKING_KINDS.Session,
      bookingStatus: BOOKING_STATUSES.Requested,
    });
    assert.equal(requested.bookingStatus, "requested");

    const accepted = createBookingRequest({
      bookingKind: BOOKING_KINDS.Event,
      bookingStatus: BOOKING_STATUSES.Accepted,
    });
    assert.equal(accepted.bookingStatus, "accepted");
  });

  it("stays apart from till / hold-runtime / room-assign / external agenda / alert / score logic", () => {
    const bookingSources = readdirSync(bookingBridgeRoot)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => readFileSync(join(bookingBridgeRoot, name), "utf8"))
      .join("\n")
      .toLowerCase();

    assert.equal(bookingSources.includes("payment logic"), false);
    assert.equal(bookingSources.includes("reservation runtime"), false);
    assert.equal(bookingSources.includes("table assignment"), false);
    assert.equal(bookingSources.includes("calendar provider"), false);
    assert.equal(bookingSources.includes("notification logic"), false);
    assert.equal(bookingSources.includes("gamification"), false);

    assert.equal(bookingSources.includes("confirmbooking"), false);
    assert.equal(bookingSources.includes("cancelbooking"), false);
    assert.equal(bookingSources.includes("paybooking"), false);
    assert.equal(bookingSources.includes("assigntable"), false);
    assert.equal(bookingSources.includes("checkin"), false);

    assert.equal(bookingSources.includes("confirmedat"), false);
    assert.equal(bookingSources.includes("paidat"), false);
    assert.equal(bookingSources.includes("numberofguests"), false);

    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies?: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/reservation"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/ticketing"),
      false,
    );

    const booking = createBookingRequest({
      bookingKind: BOOKING_KINDS.Internal,
      bookingStatus: BOOKING_STATUSES.Archived,
      hospitalityReference: hospitalityBusiness,
      parentBookingReference: "booking-parent-1",
    });
    assert.equal(isHospitalityBookingRequest(booking), true);
    assert.equal(booking.bookingStatus, "archived");
    assert.equal(booking.parentBookingReference, "booking-parent-1");
  });
});
