import type {
  BookingParticipant,
  BookingParticipantKind,
  BookingParticipantStatus,
  CreateBookingParticipantInput,
} from "./booking-participant";
import {
  BOOKING_PARTICIPANT_STATUSES,
  isBookingParticipantKind,
  isBookingParticipantStatus,
} from "./booking-participant";

let participantSequence = 0;

export interface CreateBookingParticipantOptions {
  /**
   * When set, participant may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingParticipant (in-memory — relationship context only).
 * Does not create users, auth sessions, memberships, or payments.
 * bookingReference is required — participant always belongs to a booking.
 */
export function createBookingParticipant(
  input: CreateBookingParticipantInput,
  options: CreateBookingParticipantOptions = {},
): BookingParticipant {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim() ?? "";
  const actorReference = input.actorReference?.trim();
  const identityReference = input.identityReference?.trim();
  const membershipReference = input.membershipReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!bookingReference) {
    throw new Error("bookingReference is required");
  }
  if (!isBookingParticipantKind(input.participantKind)) {
    throw new Error(
      `Unknown booking participant kind: ${String(input.participantKind)}`,
    );
  }

  const participantStatus: BookingParticipantStatus =
    input.participantStatus ?? BOOKING_PARTICIPANT_STATUSES.Invited;
  if (!isBookingParticipantStatus(participantStatus)) {
    throw new Error(
      `Unknown booking participant status: ${String(input.participantStatus)}`,
    );
  }

  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.identityReference !== undefined && !identityReference) {
    throw new Error("identityReference must not be empty when provided");
  }
  if (input.membershipReference !== undefined && !membershipReference) {
    throw new Error("membershipReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("participant does not apply to this tenant");
  }

  const providedReference = input.participantReference?.trim() ?? "";
  if (input.participantReference !== undefined && !providedReference) {
    throw new Error("participantReference must not be empty when provided");
  }

  const participantKind: BookingParticipantKind = input.participantKind;
  const participantReference =
    providedReference || allocateParticipantReference();

  return {
    participantReference,
    tenantReference,
    bookingReference,
    participantKind,
    participantStatus,
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(identityReference !== undefined && identityReference.length > 0
      ? { identityReference }
      : {}),
    ...(membershipReference !== undefined && membershipReference.length > 0
      ? { membershipReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateParticipantReference(): string {
  participantSequence += 1;
  return `participant-${participantSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingParticipantReferenceSequence(): void {
  participantSequence = 0;
}
