import type {
  BookingDocument,
  BookingDocumentKind,
  BookingDocumentStatus,
  CreateBookingDocumentInput,
} from "./booking-document";
import {
  BOOKING_DOCUMENT_STATUSES,
  isBookingDocumentKind,
  isBookingDocumentStatus,
} from "./booking-document";

let documentSequence = 0;

export interface CreateBookingDocumentOptions {
  /**
   * When set, document may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingDocument (in-memory — no storage / PDF / DMS).
 * Does not upload, sign, or store binary content.
 */
export function createBookingDocument(
  input: CreateBookingDocumentInput,
  options: CreateBookingDocumentOptions = {},
): BookingDocument {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim();
  const actorReference = input.actorReference?.trim();
  const contentReference = input.contentReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isBookingDocumentKind(input.documentKind)) {
    throw new Error(
      `Unknown booking document kind: ${String(input.documentKind)}`,
    );
  }

  const documentStatus: BookingDocumentStatus =
    input.documentStatus ?? BOOKING_DOCUMENT_STATUSES.Pending;
  if (!isBookingDocumentStatus(documentStatus)) {
    throw new Error(
      `Unknown booking document status: ${String(input.documentStatus)}`,
    );
  }

  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.contentReference !== undefined && !contentReference) {
    throw new Error("contentReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("document does not apply to this tenant");
  }

  const providedReference = input.documentReference?.trim() ?? "";
  if (input.documentReference !== undefined && !providedReference) {
    throw new Error("documentReference must not be empty when provided");
  }

  const documentKind: BookingDocumentKind = input.documentKind;
  const documentReference = providedReference || allocateDocumentReference();

  return {
    documentReference,
    tenantReference,
    documentKind,
    documentStatus,
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(contentReference !== undefined && contentReference.length > 0
      ? { contentReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateDocumentReference(): string {
  documentSequence += 1;
  return `document-${documentSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingDocumentReferenceSequence(): void {
  documentSequence = 0;
}
