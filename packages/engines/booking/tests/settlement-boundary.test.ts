/**
 * Booking Settlement Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_SETTLEMENT_KINDS,
  BOOKING_SETTLEMENT_STATUSES,
  createBookingSettlement,
  createBookingSettlementRequest,
  isBookingSettlementKind,
  isBookingSettlementRequest,
  isBookingSettlementStatus,
  isSettlementDecision,
  resetBookingSettlementReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Settlement Boundary", () => {
  beforeEach(() => {
    resetBookingSettlementReferenceSequence();
  });

  it("creates Settlement Boundary and returns a valid decision", async () => {
    const request = createBookingSettlementRequest({
      tenantReference: "tenant-a",
      amountReference: "amount-100",
      settlementKind: BOOKING_SETTLEMENT_KINDS.FullSettlement,
      bookingReference: "bk-1",
      actorReference: "actor-1",
    });
    assert.equal(isBookingSettlementRequest(request), true);
    assert.equal(request.settlementReference, "settlement-1");

    const settlement = createBookingSettlement({
      tenantReference: "tenant-a",
      defaultStatus: BOOKING_SETTLEMENT_STATUSES.Pending,
    });
    const decision = await settlement.evaluate(request);
    assert.equal(isSettlementDecision(decision), true);
    assert.equal(decision.settlementStatus, "pending");
    assert.equal(decision.settlementReference, "settlement-1");
    assert.equal(decision.amountReference, "amount-100");
  });

  it("validates tenant isolation", async () => {
    assert.throws(
      () =>
        createBookingSettlementRequest({
          tenantReference: "  ",
          amountReference: "amount-1",
          settlementKind: BOOKING_SETTLEMENT_KINDS.PartialSettlement,
        }),
      /tenantReference is required/,
    );

    const settlement = createBookingSettlement({
      tenantReference: "tenant-a",
    });
    const decision = await settlement.evaluate(
      createBookingSettlementRequest({
        tenantReference: "tenant-b",
        amountReference: "amount-1",
        settlementKind: BOOKING_SETTLEMENT_KINDS.DepositSettlement,
      }),
    );
    assert.equal(decision.settlementStatus, "cancelled");
    assert.match(decision.reason ?? "", /does not apply to this tenant/);
  });

  it("validates required opaque references", () => {
    assert.throws(
      () =>
        createBookingSettlementRequest({
          tenantReference: "tenant-a",
          amountReference: "",
          settlementKind: BOOKING_SETTLEMENT_KINDS.RefundSettlement,
        }),
      /amountReference is required/,
    );
  });

  it("accepts only known settlement kinds and statuses", () => {
    assert.equal(isBookingSettlementKind("booking.full_settlement"), true);
    assert.equal(isBookingSettlementKind("booking.partial_settlement"), true);
    assert.equal(isBookingSettlementKind("booking.deposit_settlement"), true);
    assert.equal(isBookingSettlementKind("booking.refund_settlement"), true);
    assert.equal(isBookingSettlementKind("booking.unknown"), false);

    assert.equal(isBookingSettlementStatus("pending"), true);
    assert.equal(isBookingSettlementStatus("processing"), true);
    assert.equal(isBookingSettlementStatus("settled"), true);
    assert.equal(isBookingSettlementStatus("failed"), true);
    assert.equal(isBookingSettlementStatus("cancelled"), true);
    assert.equal(isBookingSettlementStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingSettlementRequest({
          tenantReference: "tenant-a",
          amountReference: "amount-1",
          settlementKind: "booking.unknown" as never,
        }),
      /Unknown booking settlement kind/,
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

    const settlement = createBookingSettlement({
      tenantReference: "tenant-a",
      defaultStatus: BOOKING_SETTLEMENT_STATUSES.Settled,
    });
    const decision = await settlement.evaluate(
      createBookingSettlementRequest({
        tenantReference: "tenant-a",
        amountReference: "amount-1",
        settlementKind: BOOKING_SETTLEMENT_KINDS.FullSettlement,
      }),
    );
    assert.equal(decision.settlementStatus, "settled");
    assert.match(decision.reason ?? "", /Foundation settlement decision/);
  });
});
