import type {
  BookingInvoice,
  BookingInvoiceKind,
  BookingInvoiceStatus,
  CreateBookingInvoiceInput,
} from "./booking-invoice";
import {
  BOOKING_INVOICE_STATUSES,
  isBookingInvoiceKind,
  isBookingInvoiceStatus,
} from "./booking-invoice";

let invoiceSequence = 0;

export interface CreateBookingInvoiceOptions {
  /**
   * When set, invoice may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingInvoice (in-memory — no PDF / billing / fiscal).
 * Does not calculate, charge, or settle.
 */
export function createBookingInvoice(
  input: CreateBookingInvoiceInput,
  options: CreateBookingInvoiceOptions = {},
): BookingInvoice {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const amountReference = input.amountReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim();
  const actorReference = input.actorReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!amountReference) {
    throw new Error("amountReference is required");
  }
  if (!isBookingInvoiceKind(input.invoiceKind)) {
    throw new Error(
      `Unknown booking invoice kind: ${String(input.invoiceKind)}`,
    );
  }

  const invoiceStatus: BookingInvoiceStatus =
    input.invoiceStatus ?? BOOKING_INVOICE_STATUSES.Pending;
  if (!isBookingInvoiceStatus(invoiceStatus)) {
    throw new Error(
      `Unknown booking invoice status: ${String(input.invoiceStatus)}`,
    );
  }

  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("invoice does not apply to this tenant");
  }

  const providedReference = input.invoiceReference?.trim() ?? "";
  if (input.invoiceReference !== undefined && !providedReference) {
    throw new Error("invoiceReference must not be empty when provided");
  }

  const invoiceKind: BookingInvoiceKind = input.invoiceKind;
  const invoiceReference = providedReference || allocateInvoiceReference();

  return {
    invoiceReference,
    tenantReference,
    amountReference,
    invoiceKind,
    invoiceStatus,
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateInvoiceReference(): string {
  invoiceSequence += 1;
  return `invoice-${invoiceSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingInvoiceReferenceSequence(): void {
  invoiceSequence = 0;
}
