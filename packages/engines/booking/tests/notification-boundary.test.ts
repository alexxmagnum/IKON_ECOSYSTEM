/**
 * Booking Notification Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_NOTIFICATION_KINDS,
  createBookingNotificationRequest,
  isBookingNotificationKind,
  isBookingNotificationRequest,
  resetBookingNotificationReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Notification Boundary", () => {
  beforeEach(() => {
    resetBookingNotificationReferenceSequence();
  });

  it("creates a valid notification request", () => {
    const request = createBookingNotificationRequest({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      recipientReference: "user-1",
      actorReference: "actor-1",
      notificationKind: BOOKING_NOTIFICATION_KINDS.BookingConfirmed,
      metadata: { correlationId: "corr-1" },
    });

    assert.deepEqual(request, {
      notificationReference: "notification-1",
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      recipientReference: "user-1",
      actorReference: "actor-1",
      notificationKind: "booking.confirmed",
      metadata: { correlationId: "corr-1" },
    });
    assert.equal(isBookingNotificationRequest(request), true);
  });

  it("accepts only known notification kinds", () => {
    assert.equal(isBookingNotificationKind("booking.confirmed"), true);
    assert.equal(isBookingNotificationKind("booking.cancelled"), true);
    assert.equal(isBookingNotificationKind("booking.reminder"), true);
    assert.equal(isBookingNotificationKind("booking.payment_required"), true);
    assert.equal(isBookingNotificationKind("booking.unknown"), false);

    const reminder = createBookingNotificationRequest({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      recipientReference: "user-1",
      notificationKind: BOOKING_NOTIFICATION_KINDS.BookingReminder,
    });
    assert.equal(reminder.notificationKind, "booking.reminder");

    assert.throws(
      () =>
        createBookingNotificationRequest({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          recipientReference: "user-1",
          notificationKind: "booking.unknown" as never,
        }),
      /Unknown booking notification kind/,
    );
  });

  it("requires tenant, booking, and recipient references", () => {
    assert.throws(
      () =>
        createBookingNotificationRequest({
          tenantReference: "  ",
          bookingReference: "bk-1",
          recipientReference: "user-1",
          notificationKind: BOOKING_NOTIFICATION_KINDS.BookingCancelled,
        }),
      /tenantReference is required/,
    );
    assert.throws(
      () =>
        createBookingNotificationRequest({
          tenantReference: "tenant-a",
          bookingReference: "",
          recipientReference: "user-1",
          notificationKind: BOOKING_NOTIFICATION_KINDS.BookingCancelled,
        }),
      /bookingReference is required/,
    );
    assert.throws(
      () =>
        createBookingNotificationRequest({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          recipientReference: "  ",
          notificationKind: BOOKING_NOTIFICATION_KINDS.BookingPaymentRequired,
        }),
      /recipientReference is required/,
    );
  });

  it("has no external notification provider dependencies", () => {
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
  });
});
