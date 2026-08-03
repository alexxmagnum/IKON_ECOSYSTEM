import type {
  BookingException,
  BookingExceptionKind,
  BookingExceptionStatus,
  CreateBookingExceptionInput,
} from "./booking-exception";
import {
  BOOKING_EXCEPTION_STATUSES,
  isBookingExceptionKind,
  isBookingExceptionStatus,
} from "./booking-exception";

let exceptionSequence = 0;

export interface CreateBookingExceptionOptions {
  /**
   * When set, exception may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingException (in-memory — business exceptions only).
 * Does not open support cases, model infra failures, or call external providers.
 */
export function createBookingException(
  input: CreateBookingExceptionInput,
  options: CreateBookingExceptionOptions = {},
): BookingException {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim();
  const actorReference = input.actorReference?.trim();
  const reasonReference = input.reasonReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isBookingExceptionKind(input.exceptionKind)) {
    throw new Error(
      `Unknown booking exception kind: ${String(input.exceptionKind)}`,
    );
  }

  const exceptionStatus: BookingExceptionStatus =
    input.exceptionStatus ?? BOOKING_EXCEPTION_STATUSES.Pending;
  if (!isBookingExceptionStatus(exceptionStatus)) {
    throw new Error(
      `Unknown booking exception status: ${String(input.exceptionStatus)}`,
    );
  }

  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.reasonReference !== undefined && !reasonReference) {
    throw new Error("reasonReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("exception does not apply to this tenant");
  }

  const providedReference = input.exceptionReference?.trim() ?? "";
  if (input.exceptionReference !== undefined && !providedReference) {
    throw new Error("exceptionReference must not be empty when provided");
  }

  const exceptionKind: BookingExceptionKind = input.exceptionKind;
  const exceptionReference = providedReference || allocateExceptionReference();

  return {
    exceptionReference,
    tenantReference,
    exceptionKind,
    exceptionStatus,
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(reasonReference !== undefined && reasonReference.length > 0
      ? { reasonReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateExceptionReference(): string {
  exceptionSequence += 1;
  return `exception-${exceptionSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingExceptionReferenceSequence(): void {
  exceptionSequence = 0;
}
