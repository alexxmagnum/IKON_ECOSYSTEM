/**
 * Booking Invoice Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_INVOICE_KINDS,
  BOOKING_INVOICE_STATUSES,
  createBookingInvoice,
  isBookingInvoice,
  isBookingInvoiceKind,
  isBookingInvoiceStatus,
  resetBookingInvoiceReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Invoice Boundary", () => {
  beforeEach(() => {
    resetBookingInvoiceReferenceSequence();
  });

  it("creates Invoice Boundary context", () => {
    const invoice = createBookingInvoice({
      tenantReference: "tenant-a",
      amountReference: "amount-100",
      invoiceKind: BOOKING_INVOICE_KINDS.Invoice,
      bookingReference: "bk-1",
      actorReference: "actor-1",
    });
    assert.equal(isBookingInvoice(invoice), true);
    assert.equal(invoice.invoiceReference, "invoice-1");
    assert.equal(invoice.invoiceStatus, "pending");
    assert.equal(invoice.amountReference, "amount-100");
    assert.equal(invoice.invoiceKind, "booking.invoice");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingInvoice({
          tenantReference: "  ",
          amountReference: "amount-1",
          invoiceKind: BOOKING_INVOICE_KINDS.Receipt,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingInvoice(
          {
            tenantReference: "tenant-b",
            amountReference: "amount-1",
            invoiceKind: BOOKING_INVOICE_KINDS.CreditNote,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("validates required opaque references", () => {
    assert.throws(
      () =>
        createBookingInvoice({
          tenantReference: "tenant-a",
          amountReference: "",
          invoiceKind: BOOKING_INVOICE_KINDS.Adjustment,
        }),
      /amountReference is required/,
    );

    assert.throws(
      () =>
        createBookingInvoice({
          tenantReference: "tenant-a",
          amountReference: "amount-1",
          invoiceKind: BOOKING_INVOICE_KINDS.Invoice,
          invoiceReference: "  ",
        }),
      /invoiceReference must not be empty when provided/,
    );
  });

  it("accepts only known invoice kinds and statuses", () => {
    assert.equal(isBookingInvoiceKind("booking.invoice"), true);
    assert.equal(isBookingInvoiceKind("booking.receipt"), true);
    assert.equal(isBookingInvoiceKind("booking.credit_note"), true);
    assert.equal(isBookingInvoiceKind("booking.adjustment"), true);
    assert.equal(isBookingInvoiceKind("booking.unknown"), false);

    assert.equal(isBookingInvoiceStatus("pending"), true);
    assert.equal(isBookingInvoiceStatus("generated"), true);
    assert.equal(isBookingInvoiceStatus("issued"), true);
    assert.equal(isBookingInvoiceStatus("cancelled"), true);
    assert.equal(isBookingInvoiceStatus("failed"), true);
    assert.equal(isBookingInvoiceStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingInvoice({
          tenantReference: "tenant-a",
          amountReference: "amount-1",
          invoiceKind: "booking.unknown" as never,
        }),
      /Unknown booking invoice kind/,
    );

    const issued = createBookingInvoice({
      tenantReference: "tenant-a",
      amountReference: "amount-1",
      invoiceKind: BOOKING_INVOICE_KINDS.Receipt,
      invoiceStatus: BOOKING_INVOICE_STATUSES.Issued,
    });
    assert.equal(issued.invoiceStatus, "issued");
  });

  it("stays separated from Payment / Settlement / Tax providers", () => {
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

    const invoice = createBookingInvoice({
      tenantReference: "tenant-a",
      amountReference: "amount-1",
      invoiceKind: BOOKING_INVOICE_KINDS.Invoice,
      invoiceStatus: BOOKING_INVOICE_STATUSES.Generated,
    });
    assert.equal(invoice.invoiceStatus, "generated");
    assert.equal(isBookingInvoice(invoice), true);
  });
});
