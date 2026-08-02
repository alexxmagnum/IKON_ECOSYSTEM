/**
 * Payment Engine Boundary contract tests.
 * Run: pnpm --filter @motanos/payment test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  PAYMENT_KINDS,
  PAYMENT_STATUSES,
  createPayment,
  isPayment,
  isPaymentKind,
  isPaymentStatus,
  resetPaymentReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Payment Engine Boundary", () => {
  beforeEach(() => {
    resetPaymentReferenceSequence();
  });

  it("creates Payment Boundary context", () => {
    const payment = createPayment({
      tenantReference: "tenant-a",
      paymentKind: PAYMENT_KINDS.Purchase,
      commerceReference: "commerce-1",
      amountReference: "amount-1",
      currencyReference: "currency-1",
    });
    assert.equal(isPayment(payment), true);
    assert.equal(payment.paymentReference, "payment-1");
    assert.equal(payment.paymentStatus, "draft");
    assert.equal(payment.paymentKind, "payment.purchase");
    assert.equal(payment.tenantReference, "tenant-a");
    assert.equal(payment.commerceReference, "commerce-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createPayment({
          tenantReference: "  ",
          paymentKind: PAYMENT_KINDS.Registration,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createPayment(
          {
            tenantReference: "tenant-b",
            paymentKind: PAYMENT_KINDS.Membership,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );

    assert.throws(
      () =>
        createPayment({
          tenantReference: "tenant-a",
          paymentKind: PAYMENT_KINDS.Booking,
          commerceReference: "  ",
        }),
      /commerceReference must not be empty when provided/,
    );
  });

  it("accepts only known payment kinds", () => {
    assert.equal(isPaymentKind("payment.purchase"), true);
    assert.equal(isPaymentKind("payment.registration"), true);
    assert.equal(isPaymentKind("payment.membership"), true);
    assert.equal(isPaymentKind("payment.booking"), true);
    assert.equal(isPaymentKind("payment.refund"), true);
    assert.equal(isPaymentKind("payment.operational"), true);
    assert.equal(isPaymentKind("payment.unknown"), false);

    assert.throws(
      () =>
        createPayment({
          tenantReference: "tenant-a",
          paymentKind: "payment.unknown" as never,
        }),
      /Unknown payment kind/,
    );
  });

  it("accepts only known payment statuses", () => {
    assert.equal(isPaymentStatus("draft"), true);
    assert.equal(isPaymentStatus("pending"), true);
    assert.equal(isPaymentStatus("authorized"), true);
    assert.equal(isPaymentStatus("completed"), true);
    assert.equal(isPaymentStatus("failed"), true);
    assert.equal(isPaymentStatus("cancelled"), true);
    assert.equal(isPaymentStatus("refunded"), true);
    assert.equal(isPaymentStatus("unknown"), false);

    const pending = createPayment({
      tenantReference: "tenant-a",
      paymentKind: PAYMENT_KINDS.Purchase,
      paymentStatus: PAYMENT_STATUSES.Pending,
    });
    assert.equal(pending.paymentStatus, "pending");

    const authorized = createPayment({
      tenantReference: "tenant-a",
      paymentKind: PAYMENT_KINDS.Operational,
      paymentStatus: PAYMENT_STATUSES.Authorized,
    });
    assert.equal(authorized.paymentStatus, "authorized");
  });

  it("stays separated from commerce / vendor / fiscal packages", () => {
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
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/commerce"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/booking"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/membership"),
      false,
    );
    assert.equal(
      Object.keys(pkg.dependencies ?? {}).includes("@motanos/auth"),
      false,
    );

    const payment = createPayment({
      tenantReference: "tenant-a",
      paymentKind: PAYMENT_KINDS.Refund,
      paymentStatus: PAYMENT_STATUSES.Completed,
      bookingReference: "bk-1",
      providerReference: "provider-1",
    });
    assert.equal(isPayment(payment), true);
    assert.equal(payment.paymentStatus, "completed");
    assert.equal(payment.bookingReference, "bk-1");
  });
});
