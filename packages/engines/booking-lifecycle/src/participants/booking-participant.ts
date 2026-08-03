/**
 * Booking Participant Boundary — person/entity linked to a booking
 * (not Identity/Auth / Membership / Payment / Notification).
 *
 * @see DEC-BOOKING-PARTICIPANT-001
 * @see DEC-BOOKING-RECURRENCE-001
 */

/** Internal participant kinds — not identity roles or membership tiers. */
export const BOOKING_PARTICIPANT_KINDS = {
  /** Booking holder / primary party. */
  Primary: "booking.primary",
  /** Accompanying guest. */
  Guest: "booking.guest",
  /** Event attendee. */
  Attendee: "booking.attendee",
  /** Golf (or similar) player slot. */
  Player: "booking.player",
  /** Staff associated with the booking. */
  Staff: "booking.staff",
  /**
   * Participant initiated by a Booking system operation.
   * Not a technical infrastructure error.
   */
  Operational: "booking.operational",
} as const;

export type BookingParticipantKind =
  (typeof BOOKING_PARTICIPANT_KINDS)[keyof typeof BOOKING_PARTICIPANT_KINDS];

export const BOOKING_PARTICIPANT_KIND_VALUES = Object.values(
  BOOKING_PARTICIPANT_KINDS,
) as readonly BookingParticipantKind[];

/** Participant status — not Identity, Auth, or Payment state. */
export const BOOKING_PARTICIPANT_STATUSES = {
  Invited: "invited",
  Confirmed: "confirmed",
  CheckedIn: "checked_in",
  Completed: "completed",
  Cancelled: "cancelled",
  Removed: "removed",
} as const;

export type BookingParticipantStatus =
  (typeof BOOKING_PARTICIPANT_STATUSES)[keyof typeof BOOKING_PARTICIPANT_STATUSES];

export const BOOKING_PARTICIPANT_STATUS_VALUES = Object.values(
  BOOKING_PARTICIPANT_STATUSES,
) as readonly BookingParticipantStatus[];

/**
 * Opaque participant context linked to a booking.
 * bookingReference is required — a participant always belongs to a booking.
 * No PII, passwords, tokens, or payment data.
 */
export interface BookingParticipant {
  /** Opaque unique participant reference. */
  participantReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Booking this participant belongs to — required. */
  bookingReference: string;
  /** Internal participant kind. */
  participantKind: BookingParticipantKind;
  /** Participant status. */
  participantStatus: BookingParticipantStatus;
  /** Opaque actor when known. */
  actorReference?: string;
  /** Opaque identity pointer — not a live user profile. */
  identityReference?: string;
  /** Opaque membership pointer — not a live membership record. */
  membershipReference?: string;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future participant adapters (Runtime).
 * Not wired in this foundation — no auth, membership, or persistence.
 */
export interface BookingParticipantPort {
  addParticipant(
    input: CreateBookingParticipantInput,
  ): Promise<BookingParticipant>;
  resolveParticipant(
    participant: BookingParticipant,
  ): Promise<BookingParticipant>;
}

export interface CreateBookingParticipantInput {
  tenantReference: string;
  bookingReference: string;
  participantKind: BookingParticipantKind;
  participantStatus?: BookingParticipantStatus;
  participantReference?: string;
  actorReference?: string;
  identityReference?: string;
  membershipReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingParticipantKind(
  value: string,
): value is BookingParticipantKind {
  return (BOOKING_PARTICIPANT_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingParticipantStatus(
  value: string,
): value is BookingParticipantStatus {
  return (BOOKING_PARTICIPANT_STATUS_VALUES as readonly string[]).includes(
    value,
  );
}

export function isBookingParticipant(
  value: unknown,
): value is BookingParticipant {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const actorOk =
    candidate.actorReference === undefined ||
    (typeof candidate.actorReference === "string" &&
      candidate.actorReference.length > 0);
  const identityOk =
    candidate.identityReference === undefined ||
    (typeof candidate.identityReference === "string" &&
      candidate.identityReference.length > 0);
  const membershipOk =
    candidate.membershipReference === undefined ||
    (typeof candidate.membershipReference === "string" &&
      candidate.membershipReference.length > 0);
  return (
    typeof candidate.participantReference === "string" &&
    candidate.participantReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    typeof candidate.bookingReference === "string" &&
    candidate.bookingReference.length > 0 &&
    actorOk &&
    identityOk &&
    membershipOk &&
    typeof candidate.participantKind === "string" &&
    isBookingParticipantKind(candidate.participantKind) &&
    typeof candidate.participantStatus === "string" &&
    isBookingParticipantStatus(candidate.participantStatus)
  );
}

export function isBookingParticipantPort(
  value: unknown,
): value is BookingParticipantPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingParticipantPort).addParticipant === "function" &&
    typeof (value as BookingParticipantPort).resolveParticipant === "function"
  );
}
