/**
 * Booking Invoice Boundary — economic document context for a booking
 * (not Billing / PDF / fiscal issuance / Payment / Settlement).
 *
 * @see DEC-BOOKING-INVOICE-001
 * @see DEC-BOOKING-SETTLEMENT-001
 * @see DEC-BOOKING-TAX-001
 */

/** Internal invoice kinds — not legal fiscal document catalogs. */
export const BOOKING_INVOICE_KINDS = {
  Invoice: "booking.invoice",
  Receipt: "booking.receipt",
  CreditNote: "booking.credit_note",
  Adjustment: "booking.adjustment",
} as const;

export type BookingInvoiceKind =
  (typeof BOOKING_INVOICE_KINDS)[keyof typeof BOOKING_INVOICE_KINDS];

export const BOOKING_INVOICE_KIND_VALUES = Object.values(
  BOOKING_INVOICE_KINDS,
) as readonly BookingInvoiceKind[];

/** Invoice document lifecycle status — not a Payment or Settlement status. */
export const BOOKING_INVOICE_STATUSES = {
  Pending: "pending",
  Generated: "generated",
  Issued: "issued",
  Cancelled: "cancelled",
  Failed: "failed",
} as const;

export type BookingInvoiceStatus =
  (typeof BOOKING_INVOICE_STATUSES)[keyof typeof BOOKING_INVOICE_STATUSES];

export const BOOKING_INVOICE_STATUS_VALUES = Object.values(
  BOOKING_INVOICE_STATUSES,
) as readonly BookingInvoiceStatus[];

/**
 * Opaque economic document context associated with a booking.
 * No PII, fiscal identity, bank data, PDFs, or credentials.
 */
export interface BookingInvoice {
  /** Opaque unique invoice context reference. */
  invoiceReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Optional booking related to the document context. */
  bookingReference?: string;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque amount reference from economic pipeline — not a charge id. */
  amountReference: string;
  /** Internal invoice kind. */
  invoiceKind: BookingInvoiceKind;
  /** Document context status — not legal issuance. */
  invoiceStatus: BookingInvoiceStatus;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future invoice/document adapters (Runtime).
 * Not wired in this foundation — no PDF, ERP, or fiscal SDK.
 */
export interface BookingInvoicePort {
  createInvoice(
    input: CreateBookingInvoiceInput,
  ): Promise<BookingInvoice>;
}

export interface CreateBookingInvoiceInput {
  tenantReference: string;
  amountReference: string;
  invoiceKind: BookingInvoiceKind;
  invoiceStatus?: BookingInvoiceStatus;
  invoiceReference?: string;
  bookingReference?: string;
  actorReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingInvoiceKind(
  value: string,
): value is BookingInvoiceKind {
  return (BOOKING_INVOICE_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingInvoiceStatus(
  value: string,
): value is BookingInvoiceStatus {
  return (BOOKING_INVOICE_STATUS_VALUES as readonly string[]).includes(value);
}

export function isBookingInvoice(value: unknown): value is BookingInvoice {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const bookingOk =
    candidate.bookingReference === undefined ||
    (typeof candidate.bookingReference === "string" &&
      candidate.bookingReference.length > 0);
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  return (
    typeof candidate.invoiceReference === "string" &&
    candidate.invoiceReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    bookingOk &&
    actorOk &&
    typeof candidate.amountReference === "string" &&
    candidate.amountReference.length > 0 &&
    typeof candidate.invoiceKind === "string" &&
    isBookingInvoiceKind(candidate.invoiceKind) &&
    typeof candidate.invoiceStatus === "string" &&
    isBookingInvoiceStatus(candidate.invoiceStatus)
  );
}

export function isBookingInvoicePort(
  value: unknown,
): value is BookingInvoicePort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingInvoicePort).createInvoice === "function"
  );
}
