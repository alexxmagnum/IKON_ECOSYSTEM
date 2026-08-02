import type {
  BookingRecurrence,
  BookingRecurrenceKind,
  BookingRecurrenceStatus,
  CreateBookingRecurrenceInput,
} from "./booking-recurrence";
import {
  BOOKING_RECURRENCE_STATUSES,
  isBookingRecurrenceKind,
  isBookingRecurrenceStatus,
} from "./booking-recurrence";

let recurrenceSequence = 0;

export interface CreateBookingRecurrenceOptions {
  /**
   * When set, recurrence may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingRecurrence (in-memory — recurrence rule only).
 * Does not generate bookings, run cron/schedulers, or query calendars.
 * bookingReference is optional — rule may exist before instances.
 */
export function createBookingRecurrence(
  input: CreateBookingRecurrenceInput,
  options: CreateBookingRecurrenceOptions = {},
): BookingRecurrence {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim();
  const actorReference = input.actorReference?.trim();
  const patternReference = input.patternReference?.trim();
  const startReference = input.startReference?.trim();
  const endReference = input.endReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isBookingRecurrenceKind(input.recurrenceKind)) {
    throw new Error(
      `Unknown booking recurrence kind: ${String(input.recurrenceKind)}`,
    );
  }

  const recurrenceStatus: BookingRecurrenceStatus =
    input.recurrenceStatus ?? BOOKING_RECURRENCE_STATUSES.Draft;
  if (!isBookingRecurrenceStatus(recurrenceStatus)) {
    throw new Error(
      `Unknown booking recurrence status: ${String(input.recurrenceStatus)}`,
    );
  }

  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.patternReference !== undefined && !patternReference) {
    throw new Error("patternReference must not be empty when provided");
  }
  if (input.startReference !== undefined && !startReference) {
    throw new Error("startReference must not be empty when provided");
  }
  if (input.endReference !== undefined && !endReference) {
    throw new Error("endReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("recurrence does not apply to this tenant");
  }

  const providedReference = input.recurrenceReference?.trim() ?? "";
  if (input.recurrenceReference !== undefined && !providedReference) {
    throw new Error("recurrenceReference must not be empty when provided");
  }

  const recurrenceKind: BookingRecurrenceKind = input.recurrenceKind;
  const recurrenceReference =
    providedReference || allocateRecurrenceReference();

  return {
    recurrenceReference,
    tenantReference,
    recurrenceKind,
    recurrenceStatus,
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(patternReference !== undefined && patternReference.length > 0
      ? { patternReference }
      : {}),
    ...(startReference !== undefined && startReference.length > 0
      ? { startReference }
      : {}),
    ...(endReference !== undefined && endReference.length > 0
      ? { endReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateRecurrenceReference(): string {
  recurrenceSequence += 1;
  return `recurrence-${recurrenceSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingRecurrenceReferenceSequence(): void {
  recurrenceSequence = 0;
}
