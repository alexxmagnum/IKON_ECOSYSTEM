/**
 * Booking Discount Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BOOKING_DISCOUNT_OPERATIONS,
  createBookingDiscount,
  isDiscountDecision,
} from "../src/index.js";

describe("Booking Discount Boundary", () => {
  it("returns a valid discount decision when applied", async () => {
    const discount = createBookingDiscount({
      tenantReference: "tenant-a",
      discountReference: "discount-a",
      discountAmountReference: "discount-amount-10",
      applyByDefault: true,
    });

    const decision = await discount.evaluate({
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      operation: BOOKING_DISCOUNT_OPERATIONS.Create,
      bookingReference: "bk-1",
      membershipReference: "mem-1",
      resourceReference: "res-1",
      pricingReference: "pricing-a",
    });

    assert.equal(isDiscountDecision(decision), true);
    assert.equal(decision.applied, true);
    assert.equal(decision.discountReference, "discount-a");
    assert.equal(decision.discountAmountReference, "discount-amount-10");
  });

  it("rejects missing tenantReference", async () => {
    const discount = createBookingDiscount();
    const decision = await discount.evaluate({
      tenantReference: "  ",
      actorReference: "actor-1",
      operation: BOOKING_DISCOUNT_OPERATIONS.Confirm,
    });
    assert.equal(decision.applied, false);
    assert.match(decision.reason ?? "", /tenantReference is required/);
  });

  it("rejects missing actorReference", async () => {
    const discount = createBookingDiscount({ tenantReference: "tenant-a" });
    const decision = await discount.evaluate({
      tenantReference: "tenant-a",
      actorReference: "",
      operation: BOOKING_DISCOUNT_OPERATIONS.Cancel,
    });
    assert.equal(decision.applied, false);
    assert.match(decision.reason ?? "", /actorReference is required/);
  });

  it("rejects cross-tenant evaluation", async () => {
    const discount = createBookingDiscount({
      tenantReference: "tenant-a",
      applyByDefault: true,
    });

    const decision = await discount.evaluate({
      tenantReference: "tenant-b",
      actorReference: "actor-1",
      operation: BOOKING_DISCOUNT_OPERATIONS.Reschedule,
    });
    assert.equal(decision.applied, false);
    assert.match(decision.reason ?? "", /does not apply to this tenant/);
  });

  it("returns a decision without application when no discount applies", async () => {
    const discount = createBookingDiscount({
      tenantReference: "tenant-a",
      applyByDefault: false,
    });

    const decision = await discount.evaluate({
      tenantReference: "tenant-a",
      actorReference: "actor-1",
      operation: BOOKING_DISCOUNT_OPERATIONS.Create,
    });

    assert.equal(isDiscountDecision(decision), true);
    assert.equal(decision.applied, false);
    assert.equal(decision.discountReference, undefined);
    assert.equal(decision.discountAmountReference, undefined);
    assert.match(decision.reason ?? "", /No discount applies/);
  });
});
