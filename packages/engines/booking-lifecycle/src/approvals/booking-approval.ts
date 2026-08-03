/**
 * Booking Approval Boundary — business approval decision context for a booking
 * (not Authorization / RBAC / Workflow Engine / human BPM).
 *
 * @see DEC-BOOKING-APPROVAL-001
 * @see DEC-BOOKING-POLICY-001
 * @see DEC-BOOKING-AUTH-001
 */

/** Internal approval kinds — not role or permission catalogs. */
export const BOOKING_APPROVAL_KINDS = {
  Confirmation: "booking.confirmation",
  ManualReview: "booking.manual_review",
  Exception: "booking.exception",
  Override: "booking.override",
} as const;

export type BookingApprovalKind =
  (typeof BOOKING_APPROVAL_KINDS)[keyof typeof BOOKING_APPROVAL_KINDS];

export const BOOKING_APPROVAL_KIND_VALUES = Object.values(
  BOOKING_APPROVAL_KINDS,
) as readonly BookingApprovalKind[];

/** Approval decision status — not an authz allow/deny outcome. */
export const BOOKING_APPROVAL_STATUSES = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
  Expired: "expired",
  Cancelled: "cancelled",
} as const;

export type BookingApprovalStatus =
  (typeof BOOKING_APPROVAL_STATUSES)[keyof typeof BOOKING_APPROVAL_STATUSES];

export const BOOKING_APPROVAL_STATUS_VALUES = Object.values(
  BOOKING_APPROVAL_STATUSES,
) as readonly BookingApprovalStatus[];

/**
 * Opaque approval decision context associated with a booking operation.
 * No roles, JWT, permissions matrix, PII, or credentials.
 */
export interface BookingApproval {
  /** Opaque unique approval context reference. */
  approvalReference: string;
  /** Explicit tenant scope — required. */
  tenantReference: string;
  /** Optional booking related to the approval. */
  bookingReference?: string;
  /** Opaque actor when known (subject of the operation). */
  actorReference?: string;
  /** Opaque requester when distinct from actor. */
  requestedByReference?: string;
  /** Internal approval kind. */
  approvalKind: BookingApprovalKind;
  /** Approval decision status. */
  approvalStatus: BookingApprovalStatus;
  /** Controlled optional metadata — never secrets or PII. */
  metadata?: Record<string, unknown>;
}

/**
 * Outbound port for future approval adapters (Runtime).
 * Not wired in this foundation — no human workflow, RBAC, or BPM SDK.
 */
export interface BookingApprovalPort {
  requestApproval(
    input: CreateBookingApprovalInput,
  ): Promise<BookingApproval>;
  evaluateApproval(approval: BookingApproval): Promise<BookingApproval>;
}

export interface CreateBookingApprovalInput {
  tenantReference: string;
  approvalKind: BookingApprovalKind;
  approvalStatus?: BookingApprovalStatus;
  approvalReference?: string;
  bookingReference?: string;
  actorReference?: string;
  requestedByReference?: string;
  metadata?: Record<string, unknown>;
}

export function isBookingApprovalKind(
  value: string,
): value is BookingApprovalKind {
  return (BOOKING_APPROVAL_KIND_VALUES as readonly string[]).includes(value);
}

export function isBookingApprovalStatus(
  value: string,
): value is BookingApprovalStatus {
  return (BOOKING_APPROVAL_STATUS_VALUES as readonly string[]).includes(value);
}

export function isBookingApproval(value: unknown): value is BookingApproval {
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
  const requestedByOk =
    candidate.requestedByReference === undefined ||
    (typeof candidate.requestedByReference === "string" &&
      candidate.requestedByReference.length > 0);
  return (
    typeof candidate.approvalReference === "string" &&
    candidate.approvalReference.length > 0 &&
    typeof candidate.tenantReference === "string" &&
    candidate.tenantReference.length > 0 &&
    bookingOk &&
    actorOk &&
    requestedByOk &&
    typeof candidate.approvalKind === "string" &&
    isBookingApprovalKind(candidate.approvalKind) &&
    typeof candidate.approvalStatus === "string" &&
    isBookingApprovalStatus(candidate.approvalStatus)
  );
}

export function isBookingApprovalPort(
  value: unknown,
): value is BookingApprovalPort {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof (value as BookingApprovalPort).requestApproval === "function" &&
    typeof (value as BookingApprovalPort).evaluateApproval === "function"
  );
}
