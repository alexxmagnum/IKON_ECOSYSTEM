/**
 * Booking Document Boundary — associated document context for a booking
 * (not storage / PDF / DMS / Invoice / Payment).
 *
 * @see DEC-BOOKING-DOCUMENT-001
 * @see DEC-BOOKING-INVOICE-001
 */

/** Internal document kinds — not DMS/file-type catalogs. */
export const BOOKING_DOCUMENT_KINDS = {
  Confirmation: "booking.confirmation",
  Receipt: "booking.receipt",
  InvoiceCopy: "booking.invoice_copy",
  Contract: "booking.contract",
  Attachment: "booking.attachment",
} as const;

export type BookingDocumentKind =
  (typeof BOOKING_DOCUMENT_KINDS)[keyof typeof BOOKING_DOCUMENT_KINDS];

export const BOOKING_DOCUMENT_KIND_VALUES = Object.values(
  BOOKING_DOCUMENT_KINDS,
) as readonly BookingDocumentKind[];

/** Document context lifecycle status — not storage object state. */
export const BOOKING_DOCUMENT_STATUSES = {
  Pending: "pending",
  Available: "available",
  Archived: "archived",
  Expired: "expired",
  Failed: "failed",
} as const;

export type BookingDocumentStatus =
  (typeof BOOKING_DOCUMENT_STATUSES)[keyof typeof BOOKING_DOCUMENT_STATUSES];

export const BOOKING_DOCUMENT_STATUS_VALUES = Object.values(
  BOOKING_DOCUMENT_STATUSES,
) as readonly BookingDocumentStatus[];

/**
 * Opaque document context associated with a booking.
 * No binary content, private URLs, PII, or credentials.
 */
export interface BookingDocument {
  /** Opaque unique document context reference. */
  documentReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Optional booking related to the document. */
  bookingReference?: string;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Internal document kind. */
  documentKind: BookingDocumentKind;
  /** Document context status — not a file-system state. */
  documentStatus: BookingDocumentStatus;
  /**
   * Optional opaque content pointer for future adapters.
   * Never bytes, private URLs, or credentials.
   */
  contentReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future document/storage adapters (Runtime).
 * Not wired in this foundation — no S3, filesystem, or DMS SDK.
 */
export interface BookingDocumentPort {
  createDocument(
    input: CreateBookingDocumentInput,
  ): Promise<BookingDocument>;
}

export interface CreateBookingDocumentInput {
  tenantReference: string;
  documentKind: BookingDocumentKind;
  documentStatus?: BookingDocumentStatus;
  documentReference?: string;
  bookingReference?: string;
  actorReference?: string;
  contentReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingDocumentKind(
  value: string,
): value is BookingDocumentKind {
  return (BOOKING_DOCUMENT_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingDocumentStatus(
  value: string,
): value is BookingDocumentStatus {
  return (BOOKING_DOCUMENT_STATUS_VALUES as readonly string[]).includes(value);
}

export function isBookingDocument(value: unknown): value is BookingDocument {
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
  const contentOk =
    candidate.contentReference === undefined ||
    (typeof candidate.contentReference === "string" &&
      candidate.contentReference.length > 0);
  return (
    typeof candidate.documentReference === "string" &&
    candidate.documentReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    bookingOk &&
    actorOk &&
    contentOk &&
    typeof candidate.documentKind === "string" &&
    isBookingDocumentKind(candidate.documentKind) &&
    typeof candidate.documentStatus === "string" &&
    isBookingDocumentStatus(candidate.documentStatus)
  );
}

export function isBookingDocumentPort(
  value: unknown,
): value is BookingDocumentPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingDocumentPort).createDocument === "function"
  );
}
