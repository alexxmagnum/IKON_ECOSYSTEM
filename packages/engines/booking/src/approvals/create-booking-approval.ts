import type {
  BookingApproval,
  BookingApprovalKind,
  BookingApprovalStatus,
  CreateBookingApprovalInput,
} from "./booking-approval";
import {
  BOOKING_APPROVAL_STATUSES,
  isBookingApprovalKind,
  isBookingApprovalStatus,
} from "./booking-approval";

let approvalSequence = 0;

export interface CreateBookingApprovalOptions {
  /**
   * When set, approval may only be created for this tenant
   * (cross-tenant isolation — DEC-BOOKING-TENANT-001).
   */
  tenantReference?: string;
}

/**
 * Build a validated BookingApproval (in-memory — no RBAC / human BPM).
 * Does not resolve users, roles, or external approval engines.
 */
export function createBookingApproval(
  input: CreateBookingApprovalInput,
  options: CreateBookingApprovalOptions = {},
): BookingApproval {
  const tenantReference = input.tenantReference?.trim() ?? "";
  const bookingReference = input.bookingReference?.trim();
  const actorReference = input.actorReference?.trim();
  const requestedByReference = input.requestedByReference?.trim();
  const boundTenant = options.tenantReference?.trim() || undefined;

  if (!tenantReference) {
    throw new Error("tenantReference is required");
  }
  if (!isBookingApprovalKind(input.approvalKind)) {
    throw new Error(
      `Unknown booking approval kind: ${String(input.approvalKind)}`,
    );
  }

  const approvalStatus: BookingApprovalStatus =
    input.approvalStatus ?? BOOKING_APPROVAL_STATUSES.Pending;
  if (!isBookingApprovalStatus(approvalStatus)) {
    throw new Error(
      `Unknown booking approval status: ${String(input.approvalStatus)}`,
    );
  }

  if (input.bookingReference !== undefined && !bookingReference) {
    throw new Error("bookingReference must not be empty when provided");
  }
  if (input.actorReference !== undefined && !actorReference) {
    throw new Error("actorReference must not be empty when provided");
  }
  if (input.requestedByReference !== undefined && !requestedByReference) {
    throw new Error("requestedByReference must not be empty when provided");
  }

  if (boundTenant !== undefined && tenantReference !== boundTenant) {
    throw new Error("approval does not apply to this tenant");
  }

  const providedReference = input.approvalReference?.trim() ?? "";
  if (input.approvalReference !== undefined && !providedReference) {
    throw new Error("approvalReference must not be empty when provided");
  }

  const approvalKind: BookingApprovalKind = input.approvalKind;
  const approvalReference = providedReference || allocateApprovalReference();

  return {
    approvalReference,
    tenantReference,
    approvalKind,
    approvalStatus,
    ...(bookingReference !== undefined && bookingReference.length > 0
      ? { bookingReference }
      : {}),
    ...(actorReference !== undefined && actorReference.length > 0
      ? { actorReference }
      : {}),
    ...(requestedByReference !== undefined && requestedByReference.length > 0
      ? { requestedByReference }
      : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
  };
}

function allocateApprovalReference(): string {
  approvalSequence += 1;
  return `approval-${approvalSequence}`;
}

/** Test helper — reset opaque id sequence. */
export function resetBookingApprovalReferenceSequence(): void {
  approvalSequence = 0;
}
