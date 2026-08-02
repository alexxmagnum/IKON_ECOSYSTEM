import type {
  BookingCompletion,
  BookingCompletionKind,
  BookingCompletionStatus,
  CreateBookingCompletionInput,
} from "./booking-completion";
import {
  BOOKING_COMPLETION_STATUSES,
  isBookingCompletionKind,
  isBookingCompletionStatus,
} from "./booking-completion";

let completionSequence = 0;

export interface CreateBookingCompletionOptions {
  /**
   * When set, completion may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingCompletion (in-memory — finalization context only).
 * Does not mutate Booking aggregate, settle, pay, release resources, or notify.
 */
export function createBookingCompletion(
  input: CreateBookingCompletionInput,
  options: CreateBookingCompletionOptions = {},
): BookingCompletion {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const reasonReference = input.reasonReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!bookingReference) {
    throw new Error("bookingReference is required");
  }
  if (!isBookingCompletionKind(input.completionKind)) {
    throw new Error(
      `Unknown booking completion kind: ${String(input.completionKind)}`,
    );
  }

  const completionStatus: BookingCompletionStatus =
    input.completionStatus ?? BOOKING_COMPLETION_STATUSES.Requested;
  if (!isBookingCompletionStatus(completionStatus)) {
    throw new Error(
      `Unknown booking completion status: ${String(input.completionStatus)}`,
    );
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.reasonReference !== undefined && !reasonReference) {
    throw new Error("reasonReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("completion does not apply to this tenant");
  }

  const providedReference = input.completionReference?.trim() ?? "";
  if (input.completionReference !== undefined && !providedReference) {
    throw new Error("completionReference must not be empty when provided");
  }

  const completionKind: BookingCompletionKind = input.completionKind;
  const completionReference =
    providedReference || allocateCompletionReference();

  return {
    completionReference,
    tenantReference,
    bookingReference,
    completionKind,
    completionStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(reasonReference !== undefined && reasonReference.length > 0
      ? { reasonReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateCompletionReference(): string {
  completionSequence += 1;
  return `completion-${completionSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingCompletionReferenceSequence(): void {
  completionSequence = 0;
}
