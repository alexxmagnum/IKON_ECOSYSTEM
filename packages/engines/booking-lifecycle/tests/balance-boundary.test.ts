/**
 * Booking Balance Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_BALANCE_KINDS,
  BOOKING_BALANCE_STATUSES,
  createBookingBalance,
  createBookingBalanceRequest,
  isBalanceDecision,
  isBookingBalanceKind,
  isBookingBalanceRequest,
  isBookingBalanceStatus,
  resetBookingBalanceReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Balance Boundary", () => {
  beforeEach(() => {
    resetBookingBalanceReferenceSequence();
  });

  it("creates Balance Boundary and returns a valid decision", async () => {
    const request = createBookingBalanceRequest({
      tenantReference: "tenant-a",
      amountReference: "amount-100",
      balanceKind: BOOKING_BALANCE_KINDS.RemainingBalance,
      bookingReference: "bk-1",
      actorReference: "actor-1",
    });
    assert.equal(isBookingBalanceRequest(request), true);
    assert.equal(request.balanceReference, "balance-1");

    const balance = createBookingBalance({
      tenantReference: "tenant-a",
      defaultStatus: BOOKING_BALANCE_STATUSES.Pending,
    });
    const decision = await balance.evaluate(request);
    assert.equal(isBalanceDecision(decision), true);
    assert.equal(decision.balanceStatus, "pending");
    assert.equal(decision.balanceReference, "balance-1");
    assert.equal(decision.amountReference, "amount-100");
  });

  it("validates tenant isolation", async () => {
    assert.throws(
      () =>
        createBookingBalanceRequest({
          tenantReference: "  ",
          amountReference: "amount-1",
          balanceKind: BOOKING_BALANCE_KINDS.DepositBalance,
        }),
      /tenantReference is required/,
    );

    const balance = createBookingBalance({ tenantReference: "tenant-a" });
    const decision = await balance.evaluate(
      createBookingBalanceRequest({
        tenantReference: "tenant-b",
        amountReference: "amount-1",
        balanceKind: BOOKING_BALANCE_KINDS.OutstandingBalance,
      }),
    );
    assert.equal(decision.balanceStatus, "cancelled");
    assert.match(decision.reason ?? "", /does not apply to this tenant/);
  });

  it("validates required opaque references", () => {
    assert.throws(
      () =>
        createBookingBalanceRequest({
          tenantReference: "tenant-a",
          amountReference: "",
          balanceKind: BOOKING_BALANCE_KINDS.RefundBalance,
        }),
      /amountReference is required/,
    );
  });

  it("accepts only known balance kinds and statuses", () => {
    assert.equal(isBookingBalanceKind("booking.remaining_balance"), true);
    assert.equal(isBookingBalanceKind("booking.deposit_balance"), true);
    assert.equal(isBookingBalanceKind("booking.refund_balance"), true);
    assert.equal(isBookingBalanceKind("booking.outstanding_balance"), true);
    assert.equal(isBookingBalanceKind("booking.unknown"), false);

    assert.equal(isBookingBalanceStatus("pending"), true);
    assert.equal(isBookingBalanceStatus("partial"), true);
    assert.equal(isBookingBalanceStatus("settled"), true);
    assert.equal(isBookingBalanceStatus("cancelled"), true);
    assert.equal(isBookingBalanceStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingBalanceRequest({
          tenantReference: "tenant-a",
          amountReference: "amount-1",
          balanceKind: "booking.unknown" as never,
        }),
      /Unknown booking balance kind/,
    );
  });

  it("stays separated from Payment providers", async () => {
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

    const balance = createBookingBalance({
      tenantReference: "tenant-a",
      defaultStatus: BOOKING_BALANCE_STATUSES.Partial,
    });
    const decision = await balance.evaluate(
      createBookingBalanceRequest({
        tenantReference: "tenant-a",
        amountReference: "amount-1",
        balanceKind: BOOKING_BALANCE_KINDS.RemainingBalance,
      }),
    );
    assert.equal(decision.balanceStatus, "partial");
    assert.match(decision.reason ?? "", /Foundation balance decision/);
  });
});
