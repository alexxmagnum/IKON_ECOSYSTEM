/**
 * Booking Document Boundary contract tests.
 * Run: pnpm --filter @motanos/booking test
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, it } from "node:test";
import {
  BOOKING_DOCUMENT_KINDS,
  BOOKING_DOCUMENT_STATUSES,
  createBookingDocument,
  isBookingDocument,
  isBookingDocumentKind,
  isBookingDocumentStatus,
  resetBookingDocumentReferenceSequence,
} from "../src/index.js";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("Booking Document Boundary", () => {
  beforeEach(() => {
    resetBookingDocumentReferenceSequence();
  });

  it("creates Document Boundary context", () => {
    const document = createBookingDocument({
      tenantReference: "tenant-a",
      documentKind: BOOKING_DOCUMENT_KINDS.Confirmation,
      bookingReference: "bk-1",
      actorReference: "actor-1",
      contentReference: "content-opaque-1",
    });
    assert.equal(isBookingDocument(document), true);
    assert.equal(document.documentReference, "document-1");
    assert.equal(document.documentStatus, "pending");
    assert.equal(document.documentKind, "booking.confirmation");
    assert.equal(document.contentReference, "content-opaque-1");
  });

  it("validates tenant isolation", () => {
    assert.throws(
      () =>
        createBookingDocument({
          tenantReference: "  ",
          documentKind: BOOKING_DOCUMENT_KINDS.Receipt,
        }),
      /tenantReference is required/,
    );

    assert.throws(
      () =>
        createBookingDocument(
          {
            tenantReference: "tenant-b",
            documentKind: BOOKING_DOCUMENT_KINDS.Contract,
          },
          { tenantReference: "tenant-a" },
        ),
      /does not apply to this tenant/,
    );
  });

  it("validates required opaque references", () => {
    assert.throws(
      () =>
        createBookingDocument({
          tenantReference: "tenant-a",
          documentKind: BOOKING_DOCUMENT_KINDS.Attachment,
          documentReference: "  ",
        }),
      /documentReference must not be empty when provided/,
    );

    assert.throws(
      () =>
        createBookingDocument({
          tenantReference: "tenant-a",
          documentKind: BOOKING_DOCUMENT_KINDS.InvoiceCopy,
          contentReference: "  ",
        }),
      /contentReference must not be empty when provided/,
    );
  });

  it("accepts only known document kinds and statuses", () => {
    assert.equal(isBookingDocumentKind("booking.confirmation"), true);
    assert.equal(isBookingDocumentKind("booking.receipt"), true);
    assert.equal(isBookingDocumentKind("booking.invoice_copy"), true);
    assert.equal(isBookingDocumentKind("booking.contract"), true);
    assert.equal(isBookingDocumentKind("booking.attachment"), true);
    assert.equal(isBookingDocumentKind("booking.unknown"), false);

    assert.equal(isBookingDocumentStatus("pending"), true);
    assert.equal(isBookingDocumentStatus("available"), true);
    assert.equal(isBookingDocumentStatus("archived"), true);
    assert.equal(isBookingDocumentStatus("expired"), true);
    assert.equal(isBookingDocumentStatus("failed"), true);
    assert.equal(isBookingDocumentStatus("unknown"), false);

    assert.throws(
      () =>
        createBookingDocument({
          tenantReference: "tenant-a",
          documentKind: "booking.unknown" as never,
        }),
      /Unknown booking document kind/,
    );

    const available = createBookingDocument({
      tenantReference: "tenant-a",
      documentKind: BOOKING_DOCUMENT_KINDS.Receipt,
      documentStatus: BOOKING_DOCUMENT_STATUSES.Available,
    });
    assert.equal(available.documentStatus, "available");
  });

  it("stays separated from Invoice / Payment / Settlement providers", () => {
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

    const document = createBookingDocument({
      tenantReference: "tenant-a",
      documentKind: BOOKING_DOCUMENT_KINDS.Confirmation,
      documentStatus: BOOKING_DOCUMENT_STATUSES.Archived,
    });
    assert.equal(document.documentStatus, "archived");
    assert.equal(isBookingDocument(document), true);
  });
});
