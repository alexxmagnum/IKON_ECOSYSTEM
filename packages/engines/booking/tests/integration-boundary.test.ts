/**
 * Booking Integration Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  BOOKING_INTEGRATION_FORBIDDEN_REQUEST_KEYS,
  BOOKING_NOTIFICATION_KINDS,
  isBookingIntegrationPort,
  type BookingIntegrationPort,
  type BookingNotificationRequest,
  type BookingPaymentRequest,
  type BookingCalendarSyncRequest,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function createValidIntegrationStub(): BookingIntegrationPort {
  return {
    notifications: {
      async sendBookingNotification() {
        /* no-op stub — not a provider */
      },
    },
    payments: {
      async requestPayment() {
        return { paymentReference: "pay-ref-1" };
      },
    },
    calendar: {
      async syncBookingCalendar() {
        /* no-op stub — not a provider */
      },
    },
  };
}

describe("Booking Integration Boundary", () => {
  it("accepts a valid integration port contract", async () => {
    const port = createValidIntegrationStub();
    assert.equal(isBookingIntegrationPort(port), true);

    const notification: BookingNotificationRequest = {
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      recipientReference: "user-1",
      notificationKind: BOOKING_NOTIFICATION_KINDS.BookingConfirmed,
    };
    await port.notifications.sendBookingNotification(notification);

    const payment: BookingPaymentRequest = {
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      payerReference: "user-1",
      amountReference: "amount-1",
    };
    const paymentResult = await port.payments.requestPayment(payment);
    assert.equal(paymentResult.paymentReference, "pay-ref-1");

    const calendar: BookingCalendarSyncRequest = {
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      resourceReference: "res-1",
      startAt: "2026-08-01T10:00:00.000Z",
      endAt: "2026-08-01T11:00:00.000Z",
    };
    await port.calendar.syncBookingCalendar(calendar);
  });

  it("has no external provider dependencies in package.json", () => {
    const pkg = JSON.parse(
      readFileSync(join(packageRoot, "package.json"), "utf8"),
    ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };
    // Only MotanOS workspace packages — no vendor SDKs.
    assert.deepEqual(Object.keys(pkg.dependencies ?? {}).sort(), [
      "@motanos/contracts",
      "@motanos/core",
    ]);
    assert.equal(pkg.devDependencies, undefined);
    for (const name of Object.keys(deps)) {
      assert.equal(name.startsWith("@motanos/"), true, `unexpected dep ${name}`);
    }
  });

  it("request contracts do not declare secret or credential fields", () => {
    const notificationKeys: (keyof BookingNotificationRequest)[] = [
      "tenantReference",
      "bookingReference",
      "recipientReference",
      "notificationKind",
      "metadata",
    ];
    const paymentKeys: (keyof BookingPaymentRequest)[] = [
      "tenantReference",
      "bookingReference",
      "payerReference",
      "amountReference",
      "metadata",
    ];
    const calendarKeys: (keyof BookingCalendarSyncRequest)[] = [
      "tenantReference",
      "bookingReference",
      "resourceReference",
      "startAt",
      "endAt",
      "metadata",
    ];

    for (const key of [
      ...notificationKeys,
      ...paymentKeys,
      ...calendarKeys,
    ]) {
      assert.equal(
        (BOOKING_INTEGRATION_FORBIDDEN_REQUEST_KEYS as readonly string[]).includes(
          key,
        ),
        false,
        `forbidden key leaked into contract: ${key}`,
      );
    }

    const sampleNotification: BookingNotificationRequest = {
      tenantReference: "t",
      bookingReference: "b",
      recipientReference: "r",
      notificationKind: BOOKING_NOTIFICATION_KINDS.BookingCreated,
    };
    for (const forbidden of BOOKING_INTEGRATION_FORBIDDEN_REQUEST_KEYS) {
      assert.equal(
        Object.prototype.hasOwnProperty.call(sampleNotification, forbidden),
        false,
      );
    }
  });

  it("rejects incomplete integration ports", () => {
    assert.equal(isBookingIntegrationPort({}), false);
    assert.equal(
      isBookingIntegrationPort({
        notifications: { sendBookingNotification: async () => undefined },
      }),
      false,
    );
  });
});
