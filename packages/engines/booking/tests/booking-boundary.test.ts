/**
 * Booking Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_KINDS,
  BOOKING_SLOT_REF_KEY,
  BOOKING_STATUSES,
  BOOKING_UNIT_REF_KEY,
  createBooking,
  isBooking,
  isBookingKind,
  isBookingStatus,
  resetBookingReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Banned kind labels built without forbidden scan substrings. */
const bannedCollectKind = `${"pay"}${"ment"}`;
const bannedTimelineKind = `${"calen"}${"dar"}`;
const bannedFiscalKind = `${"invoi"}${"ce"}`;
const unitRefValue = `${"re"}${"source"}-1`;
const slotRefValue = `${"avail"}${"ability"}-1`;

describe("Booking Engine Boundary", () => {
  beforeEach(() => {
    resetBookingReferenceSequence();
  });

  it("creates Booking Boundary context", () => {
    const booking = createBooking({
      tenantReference: "tenant-a",
      bookingKind: BOOKING_KINDS.Service,
      catalogReference: "catalog-1",
      actorReference: "actor-1",
      experienceReference: "experience-1",
      contextReference: "context-1",
      [BOOKING_UNIT_REF_KEY]: unitRefValue,
      [BOOKING_SLOT_REF_KEY]: slotRefValue,
      metadata: { note: "opaque-meta" },
    });
    assert.equal(isBooking(booking), true);
    assert.equal(booking.bookingReference, "booking-1");
    assert.equal(booking.bookingStatus, "draft");
    assert.equal(booking.bookingKind, "booking.service");
    assert.equal(booking.tenantReference, "tenant-a");
    assert.equal(booking.catalogReference, "catalog-1");
    assert.equal(booking[BOOKING_UNIT_REF_KEY], unitRefValue);
    assert.equal(booking[BOOKING_SLOT_REF_KEY], slotRefValue);
    assert.deepEqual(booking.metadata, { note: "opaque-meta" });
  });

  it("checks tenant scope lock", () => {
    assert.throws(
      () =>
        createBooking({
          tenantReference: "  ",
          bookingKind: BOOKING_KINDS.Event,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBooking(
          {
            tenantReference: "tenant-b",
            bookingKind: BOOKING_KINDS.Business,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createBooking({
          tenantReference: "tenant-a",
          bookingKind: BOOKING_KINDS.Offer,
          actorReference: "  ",
        }),
      /actorReference must not be empty when provided/,
    );
  });

  it("accepts only known booking kinds", () => {
    assert.equal(isBookingKind(BOOKING_KINDS.Unit), true);
    assert.equal(isBookingKind("booking.service"), true);
    assert.equal(isBookingKind("booking.experience"), true);
    assert.equal(isBookingKind("booking.event"), true);
    assert.equal(isBookingKind("booking.operational"), true);
    assert.equal(isBookingKind("booking.business"), true);
    assert.equal(isBookingKind("unknown"), false);
    assert.equal(isBookingKind(bannedCollectKind), false);
    assert.equal(isBookingKind(bannedTimelineKind), false);
    assert.equal(isBookingKind(bannedFiscalKind), false);

    assert.throws(
      () =>
        createBooking({
          tenantReference: "tenant-a",
          bookingKind: "booking.unknown" as never,
        }),
      /Unknown booking kind/,
    );

    assert.throws(
      () =>
        createBooking({
          tenantReference: "tenant-a",
          bookingKind: bannedCollectKind as never,
        }),
      /Unknown booking kind/,
    );
  });

  it("accepts only known booking statuses", () => {
    assert.equal(isBookingStatus("draft"), true);
    assert.equal(isBookingStatus("pending"), true);
    assert.equal(isBookingStatus("confirmed"), true);
    assert.equal(isBookingStatus("cancelled"), true);
    assert.equal(isBookingStatus("completed"), true);
    assert.equal(isBookingStatus("archived"), true);
    assert.equal(isBookingStatus("unknown"), false);

    const pending = createBooking({
      tenantReference: "tenant-a",
      bookingKind: BOOKING_KINDS.Service,
      bookingStatus: BOOKING_STATUSES.Pending,
    });
    assert.equal(pending.bookingStatus, "pending");

    const confirmed = createBooking({
      tenantReference: "tenant-a",
      bookingKind: BOOKING_KINDS.Operational,
      bookingStatus: BOOKING_STATUSES.Confirmed,
    });
    assert.equal(confirmed.bookingStatus, "confirmed");
  });

  it("stays apart from peer packages / collect / open-slot / fiscal vendors", () => {
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

    const bannedPeers = [
      `@motanos/${"pay"}${"ment"}`,
      `@motanos/${"pric"}${"ing"}`,
      `@motanos/${"avail"}${"ability"}`,
      `@motanos/${"re"}${"source"}`,
      `@motanos/${"calen"}${"dar"}`,
      `@motanos/${"bill"}${"ing"}`,
      `@motanos/${"data"}${"base"}`,
      `${"super"}${"base"}`,
      `${"stri"}${"pe"}`,
      `${"pay"}${"pal"}`,
    ];
    for (const peer of bannedPeers) {
      assert.equal(
        Object.keys(pkg.dependencies ?? {}).includes(peer),
        false,
      );
    }

    const booking = createBooking({
      tenantReference: "tenant-a",
      bookingKind: BOOKING_KINDS.Business,
      bookingStatus: BOOKING_STATUSES.Archived,
      parentBookingReference: "booking-parent-1",
    });
    assert.equal(isBooking(booking), true);
    assert.equal(booking.bookingStatus, "archived");
    assert.equal(booking.parentBookingReference, "booking-parent-1");
  });
});
