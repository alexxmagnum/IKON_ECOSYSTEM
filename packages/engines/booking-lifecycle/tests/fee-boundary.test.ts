/**
 * Booking Fee Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_FEE_KINDS,
  createBookingFee,
  createBookingFeeRequest,
  isBookingFeeKind,
  isBookingFeeRequest,
  isFeeDecision,
  resetBookingFeeReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Fee Boundary", () => {
  beforeEach(() => {
    resetBookingFeeReferenceSequence();
  });

  it("creates Fee Boundary and returns a valid decision", async () => {
    const request = createBookingFeeRequest({
      tenantReference: "tenant-a",
      amountReference: "amount-100",
      feeKind: BOOKING_FEE_KINDS.ServiceFee,
      bookingReference: "bk-1",
      actorReference: "actor-1",
    });
    assert.equal(isBookingFeeRequest(request), true);
    assert.equal(request.feeReference, "fee-1");

    const fee = createBookingFee({
      tenantReference: "tenant-a",
      applicableByDefault: true,
    });
    const decision = await fee.evaluate(request);
    assert.equal(isFeeDecision(decision), true);
    assert.equal(decision.feeApplicable, true);
    assert.equal(decision.feeReference, "fee-1");
    assert.equal(decision.amountReference, "amount-100");
  });

  it("validates tenant isolation", async () => {
    assert.throws(
      () =>
        createBookingFeeRequest({
          tenantReference: "  ",
          amountReference: "amount-1",
          feeKind: BOOKING_FEE_KINDS.PlatformFee,
        }),
      /tenantReference is required/,
    );

    const fee = createBookingFee({ tenantReference: "tenant-a" });
    const decision = await fee.evaluate(
      createBookingFeeRequest({
        tenantReference: "tenant-b",
        amountReference: "amount-1",
        feeKind: BOOKING_FEE_KINDS.BookingFee,
      }),
    );
    assert.equal(decision.feeApplicable, false);
    assert.match(decision.reason ?? "", /does not apply to this tenant/);
  });

  it("validates required opaque references", () => {
    assert.throws(
      () =>
        createBookingFeeRequest({
          tenantReference: "tenant-a",
          amountReference: "",
          feeKind: BOOKING_FEE_KINDS.ConvenienceFee,
        }),
      /amountReference is required/,
    );
  });

  it("accepts only known fee kinds", () => {
    assert.equal(isBookingFeeKind("booking.service_fee"), true);
    assert.equal(isBookingFeeKind("booking.platform_fee"), true);
    assert.equal(isBookingFeeKind("booking.booking_fee"), true);
    assert.equal(isBookingFeeKind("booking.convenience_fee"), true);
    assert.equal(isBookingFeeKind("booking.unknown"), false);

    assert.throws(
      () =>
        createBookingFeeRequest({
          tenantReference: "tenant-a",
          amountReference: "amount-1",
          feeKind: "booking.unknown" as never,
        }),
      /Unknown booking fee kind/,
    );
  });

  it("stays separated from Pricing, Tax, and Payment providers", async () => {
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

    const fee = createBookingFee({ tenantReference: "tenant-a" });
    const decision = await fee.evaluate(
      createBookingFeeRequest({
        tenantReference: "tenant-a",
        amountReference: "amount-1",
        feeKind: BOOKING_FEE_KINDS.ServiceFee,
      }),
    );
    assert.equal(decision.feeApplicable, false);
    assert.match(decision.reason ?? "", /No fee applies/);
  });
});
