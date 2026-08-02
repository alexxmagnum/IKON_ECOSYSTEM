/**
 * Booking Payment Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_PAYMENT_KINDS,
  createBookingPaymentRequest,
  isBookingPaymentKind,
  isBookingPaymentRequest,
  resetBookingPaymentReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Payment Boundary", () => {
  beforeEach(() => {
    resetBookingPaymentReferenceSequence();
  });

  it("creates a valid payment request", () => {
    const request = createBookingPaymentRequest({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      payerReference: "user-1",
      actorReference: "actor-1",
      paymentKind: BOOKING_PAYMENT_KINDS.BookingFullPayment,
      amountReference: "amount-1",
      metadata: { correlationId: "corr-1" },
    });

    assert.deepEqual(request, {
      paymentReference: "payment-1",
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      payerReference: "user-1",
      actorReference: "actor-1",
      paymentKind: "booking.full_payment",
      amountReference: "amount-1",
      metadata: { correlationId: "corr-1" },
    });
    assert.equal(isBookingPaymentRequest(request), true);
  });

  it("accepts only known payment kinds", () => {
    assert.equal(isBookingPaymentKind("booking.deposit"), true);
    assert.equal(isBookingPaymentKind("booking.full_payment"), true);
    assert.equal(isBookingPaymentKind("booking.payment_required"), true);
    assert.equal(isBookingPaymentKind("booking.refund"), true);
    assert.equal(isBookingPaymentKind("booking.unknown"), false);

    const deposit = createBookingPaymentRequest({
      tenantReference: "tenant-a",
      bookingReference: "bk-1",
      payerReference: "user-1",
      paymentKind: BOOKING_PAYMENT_KINDS.BookingDeposit,
      amountReference: "amount-deposit",
    });
    assert.equal(deposit.paymentKind, "booking.deposit");

    assert.throws(
      () =>
        createBookingPaymentRequest({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          payerReference: "user-1",
          paymentKind: "booking.unknown" as never,
          amountReference: "amount-1",
        }),
      /Unknown booking payment kind/,
    );
  });

  it("requires tenant, booking, payer, and amount references", () => {
    assert.throws(
      () =>
        createBookingPaymentRequest({
          tenantReference: "  ",
          bookingReference: "bk-1",
          payerReference: "user-1",
          paymentKind: BOOKING_PAYMENT_KINDS.BookingPaymentRequired,
          amountReference: "amount-1",
        }),
      /tenantReference is required/,
    );
    assert.throws(
      () =>
        createBookingPaymentRequest({
          tenantReference: "tenant-a",
          bookingReference: "",
          payerReference: "user-1",
          paymentKind: BOOKING_PAYMENT_KINDS.BookingRefund,
          amountReference: "amount-1",
        }),
      /bookingReference is required/,
    );
    assert.throws(
      () =>
        createBookingPaymentRequest({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          payerReference: "  ",
          paymentKind: BOOKING_PAYMENT_KINDS.BookingFullPayment,
          amountReference: "amount-1",
        }),
      /payerReference is required/,
    );
    assert.throws(
      () =>
        createBookingPaymentRequest({
          tenantReference: "tenant-a",
          bookingReference: "bk-1",
          payerReference: "user-1",
          paymentKind: BOOKING_PAYMENT_KINDS.BookingFullPayment,
          amountReference: "",
        }),
      /amountReference is required/,
    );
  });

  it("has no external payment provider dependencies", () => {
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
