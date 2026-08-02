/**
 * Booking Tax Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_TAX_KINDS,
  createBookingTax,
  createBookingTaxRequest,
  isBookingTaxKind,
  isBookingTaxRequest,
  isTaxDecision,
  resetBookingTaxReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Tax Boundary", () => {
  beforeEach(() => {
    resetBookingTaxReferenceSequence();
  });

  it("creates Tax Boundary and returns a valid decision", async () => {
    const request = createBookingTaxRequest({
      tenantReference: "tenant-a",
      amountReference: "amount-100",
      taxKind: BOOKING_TAX_KINDS.ServiceTax,
      bookingReference: "bk-1",
      actorReference: "actor-1",
    });
    assert.equal(isBookingTaxRequest(request), true);
    assert.equal(request.taxReference, "tax-1");

    const tax = createBookingTax({
      tenantReference: "tenant-a",
      applicableByDefault: true,
    });
    const decision = await tax.evaluate(request);
    assert.equal(isTaxDecision(decision), true);
    assert.equal(decision.taxApplicable, true);
    assert.equal(decision.taxReference, "tax-1");
    assert.equal(decision.amountReference, "amount-100");
  });

  it("validates tenant isolation", async () => {
    assert.throws(
      () =>
        createBookingTaxRequest({
          tenantReference: "  ",
          amountReference: "amount-1",
          taxKind: BOOKING_TAX_KINDS.LocalTax,
        }),
      /tenantReference is required/,
    );

    const tax = createBookingTax({ tenantReference: "tenant-a" });
    const decision = await tax.evaluate(
      createBookingTaxRequest({
        tenantReference: "tenant-b",
        amountReference: "amount-1",
        taxKind: BOOKING_TAX_KINDS.FeeTax,
      }),
    );
    assert.equal(decision.taxApplicable, false);
    assert.match(decision.reason ?? "", /does not apply to this tenant/);
  });

  it("validates required opaque references", () => {
    assert.throws(
      () =>
        createBookingTaxRequest({
          tenantReference: "tenant-a",
          amountReference: "",
          taxKind: BOOKING_TAX_KINDS.VatReference,
        }),
      /amountReference is required/,
    );
  });

  it("accepts only known tax kinds", () => {
    assert.equal(isBookingTaxKind("booking.service_tax"), true);
    assert.equal(isBookingTaxKind("booking.local_tax"), true);
    assert.equal(isBookingTaxKind("booking.fee_tax"), true);
    assert.equal(isBookingTaxKind("booking.vat_reference"), true);
    assert.equal(isBookingTaxKind("booking.unknown"), false);

    assert.throws(
      () =>
        createBookingTaxRequest({
          tenantReference: "tenant-a",
          amountReference: "amount-1",
          taxKind: "booking.unknown" as never,
        }),
      /Unknown booking tax kind/,
    );
  });

  it("stays separated from Pricing and Payment providers", async () => {
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

    const tax = createBookingTax({ tenantReference: "tenant-a" });
    const decision = await tax.evaluate(
      createBookingTaxRequest({
        tenantReference: "tenant-a",
        amountReference: "amount-1",
        taxKind: BOOKING_TAX_KINDS.ServiceTax,
      }),
    );
    assert.equal(decision.taxApplicable, false);
    assert.match(decision.reason ?? "", /No tax applies/);
  });
});
