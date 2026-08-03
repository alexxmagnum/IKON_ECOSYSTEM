import type {
  BookingAvailabilityKind,
  BookingAvailabilityRequest,
  CreateBookingAvailabilityRequestInput,
} from "./booking-availability-request";
import { isBookingAvailabilityKind } from "./booking-availability-request";

let availabilitySequence = 0;

/**
 * Build a validated BookingAvailabilityRequest (in-memory — no calendar I/O).
 */
export function createBookingAvailabilityRequest(
  input: CreateBookingAvailabilityRequestInput,
): BookingAvailabilityRequest {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const resourceReference = input.resourceReference?.trim() ?? "";
  const startAt = input.startAt?.trim() ?? "";
  const endAt = input.endAt?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim();
  const actorReference = input.actorReference?.trim();

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!resourceReference) {
    throw new Error("resourceReference is required");
  }
  if (!startAt) {
    throw new Error("startAt is required");
  }
  if (!endAt) {
    throw new Error("endAt is required");
  }
  if (!isBookingAvailabilityKind(input.availabilityKind)) {
    throw new Error(
      `Unknown booking availability kind: ${String(input.availabilityKind)}`,
    );
  }
  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }

  const availabilityKind: BookingAvailabilityKind = input.availabilityKind;
  const availabilityReference =
    input.availabilityReference?.trim() || allocateAvailabilityReference();

  return {
    availabilityReference,
    tenantReference,
    resourceReference,
    availabilityKind,
    startAt,
    endAt,
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

/**
 * Tenant isolation helper for availability requests (DEC-BOOKING-TENANT-001).
 */
export function availabilityBelongsToTenant(
  request: BookingAvailabilityRequest,
  tenantReference: string,
): boolean {
  const expected = tenantReference.trim();
  if (!expected) {
    return false;
  }
  return request.tenantReference === expected;
}

function allocateAvailabilityReference(): string {
  availabilitySequence += 1;
  return `availability-${availabilitySequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingAvailabilityReferenceSequence(): void {
  availabilitySequence = 0;
}
